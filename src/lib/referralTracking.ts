import { supabase } from '../lib/supabase';

export const trackReferral = async (referredUserId: string, referralCode?: string) => {
  if (!referralCode) return null;

  try {
    // Find the referrer by referral code
    const { data: referrer, error: referrerError } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('referral_code', referralCode)
      .eq('role', 'business')
      .single();

    if (referrerError || !referrer) {
      console.log('Invalid referral code:', referralCode);
      return null;
    }

    // Check if this referral already exists
    const { data: existingReferral } = await supabase
      .from('referrals')
      .select('id')
      .eq('referrer_id', referrer.id)
      .eq('referred_user_id', referredUserId)
      .single();

    if (existingReferral) {
      console.log('Referral already tracked');
      return existingReferral;
    }

    // Create the referral record
    const { data: referral, error: referralError } = await supabase
      .from('referrals')
      .insert({
        referrer_id: referrer.id,
        referred_user_id: referredUserId,
        status: 'pending',
        points_awarded: 0,
      })
      .select()
      .single();

    if (referralError) {
      console.error('Error creating referral:', referralError);
      return null;
    }

    // Award points to referrer
    const { data: settings } = await supabase
      .from('referral_program_settings')
      .select('points_per_referral')
      .eq('id', 1)
      .single();

    const pointsToAward = settings?.points_per_referral || 10;

    await supabase
      .from('referral_points')
      .insert({
        user_id: referrer.id,
        points: pointsToAward,
        transaction_type: 'earned',
        description: `Referral: ${referredUserId}`,
        referral_id: referral.id,
      });

    // Check if referrer has earned enough points for a reward
    await checkAndAwardReward(referrer.id);

    console.log('Referral tracked successfully:', referral);
    return referral;

  } catch (error) {
    console.error('Error tracking referral:', error);
    return null;
  }
};

export const checkAndAwardReward = async (referrerId: string) => {
  try {
    // Get referral settings
    const { data: settings } = await supabase
      .from('referral_program_settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (!settings || !settings.is_enabled) return;

    // Count completed referrals
    const { data: completedReferrals } = await supabase
      .from('referrals')
      .select('id')
      .eq('referrer_id', referrerId)
      .eq('status', 'completed');

    const referralCount = completedReferrals?.length || 0;

    if (referralCount >= settings.required_referrals) {
      // Check if they already received this reward
      const { data: existingRedemption } = await supabase
        .from('referral_redemptions')
        .select('id')
        .eq('user_id', referrerId)
        .eq('status', 'approved')
        .single();

      if (!existingRedemption) {
        // Award free subscription
        await supabase
          .from('referral_redemptions')
          .insert({
            user_id: referrerId,
            points_used: settings.required_referrals,
            status: 'approved',
            notes: `Free ${settings.reward_months} months subscription - ${settings.reward_label}`,
          });

        // Update subscription
        const currentDate = new Date();
        const newEndDate = new Date(currentDate.setMonth(currentDate.getMonth() + settings.reward_months));

        await supabase
          .from('profiles')
          .update({
            subscription_status: 'active',
            subscription_end_date: newEndDate.toISOString(),
            stripe_payment_id: 'REFERRAL_REWARD',
          })
          .eq('id', referrerId);

        console.log(`Awarded free subscription to user ${referrerId}`);
      }
    }
  } catch (error) {
    console.error('Error checking reward eligibility:', error);
  }
};

export const completeReferral = async (referralId: string) => {
  try {
    const { error } = await supabase
      .from('referrals')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString(),
        points_awarded: 10
      })
      .eq('id', referralId);

    if (error) throw error;

    // Get referral to find referrer
    const { data: referral } = await supabase
      .from('referrals')
      .select('referrer_id')
      .eq('id', referralId)
      .single();

    if (referral) {
      await checkAndAwardReward(referral.referrer_id);
    }

    return true;
  } catch (error) {
    console.error('Error completing referral:', error);
    return false;
  }
};
