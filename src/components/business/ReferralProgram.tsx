import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { Share2, Users, Gift, TrendingUp, Copy, Check, Crown, Target } from 'lucide-react';
import toast from 'react-hot-toast';

interface ReferralStats {
  total_referrals: number;
  pending_referrals: number;
  completed_referrals: number;
  points_earned: number;
  next_reward_at: number;
  referral_code: string;
}

const ReferralProgram = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [settings, setSettings] = useState<any>(null);

  const requiredReferrals = 30;
  const referralLink = stats?.referral_code 
    ? `https://www.theberman.eu/signup?ref=${stats.referral_code}`
    : '';

  useEffect(() => {
    fetchReferralStats();
    fetchReferralSettings();
  }, [user]);

  const fetchReferralStats = async () => {
    if (!user) return;

    try {
      // Get referral code
      const { data: profileData } = await supabase
        .from('profiles')
        .select('referral_code')
        .eq('id', user.id)
        .single();

      // Generate referral code if doesn't exist
      let referralCode = profileData?.referral_code;
      if (!referralCode) {
        referralCode = generateReferralCode();
        await supabase
          .from('profiles')
          .update({ referral_code: referralCode })
          .eq('id', user.id);
      }

      // Get referral stats
      const { data: referrals } = await supabase
        .from('referrals')
        .select('status, created_at')
        .eq('referrer_id', user.id);

      const total_referrals = referrals?.length || 0;
      const pending_referrals = referrals?.filter(r => r.status === 'pending').length || 0;
      const completed_referrals = referrals?.filter(r => r.status === 'completed').length || 0;

      // Get points
      const { data: points } = await supabase
        .from('referral_points')
        .select('points')
        .eq('user_id', user.id);

      const points_earned = points?.reduce((sum, p) => sum + p.points, 0) || 0;

      setStats({
        total_referrals,
        pending_referrals,
        completed_referrals,
        points_earned,
        next_reward_at: requiredReferrals,
        referral_code: referralCode
      });
    } catch (error) {
      console.error('Error fetching referral stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReferralSettings = async () => {
    try {
      const { data } = await supabase
        .from('referral_program_settings')
        .select('*')
        .eq('id', 1)
        .single();

      setSettings(data);
    } catch (error) {
      console.error('Error fetching referral settings:', error);
    }
  };

  const generateReferralCode = () => {
    const adjectives = ['Swift', 'Bright', 'Smart', 'Pro', 'Elite', 'Premium', 'Expert'];
    const nouns = ['Energy', 'Power', 'Green', 'Eco', 'Solar', 'Save', 'Tech'];
    const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNum = Math.floor(Math.random() * 999) + 1;
    return `${randomAdj}${randomNoun}${randomNum}`.toUpperCase();
  };

  const copyReferralLink = async () => {
    if (!referralLink) return;

    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success('Referral link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const shareReferralLink = async () => {
    if (!referralLink) return;

    const shareData = {
      title: 'Join The Berman Business Network',
      text: `I'm inviting you to join The Berman - Ireland's leading energy platform. Use my referral link to get started!`,
      url: referralLink
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await copyReferralLink();
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded-lg w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded-lg w-full"></div>
          <div className="h-4 bg-gray-200 rounded-lg w-2/3"></div>
        </div>
      </div>
    );
  }

  const progressPercentage = Math.min((stats!.total_referrals / requiredReferrals) * 100, 100);
  const referralsNeeded = Math.max(requiredReferrals - stats!.total_referrals, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#007F00] to-[#006600] rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <Gift className="w-6 h-6" />
              Referral Program
            </h3>
            <p className="text-green-50">
              Invite businesses and earn free subscription months
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{stats!.total_referrals}/{requiredReferrals}</div>
            <div className="text-sm text-green-50">Referrals</div>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold text-gray-900 flex items-center gap-2">
            <Target className="w-4 h-4" />
            Progress to Free Subscription
          </h4>
          <span className="text-sm text-gray-500">{progressPercentage.toFixed(0)}%</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div 
            className="bg-gradient-to-r from-[#007F00] to-[#006600] h-3 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">
              {referralsNeeded > 0 ? `${referralsNeeded} more needed` : 'Goal reached!'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-yellow-500" />
            <span className="font-semibold text-gray-900">
              {settings?.reward_months || 12} months free
            </span>
          </div>
        </div>
      </div>

      {/* Referral Link */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Share2 className="w-4 h-4" />
          Your Referral Link
        </h4>
        
        <div className="flex gap-2 mb-4">
          <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
            <code className="text-sm text-gray-600 break-all">{referralLink}</code>
          </div>
          <button
            onClick={copyReferralLink}
            className="px-4 py-3 bg-[#007F00] text-white rounded-lg hover:bg-[#006600] transition-colors flex items-center gap-2"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        <button
          onClick={shareReferralLink}
          className="w-full py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
        >
          <Share2 size={16} />
          Share Referral Link
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-5 h-5 text-blue-500" />
            <span className="text-2xl font-bold text-gray-900">{stats!.total_referrals}</span>
          </div>
          <div className="text-sm text-gray-600">Total Referrals</div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <span className="text-2xl font-bold text-gray-900">{stats!.completed_referrals}</span>
          </div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <Gift className="w-5 h-5 text-purple-500" />
            <span className="text-2xl font-bold text-gray-900">{stats!.points_earned}</span>
          </div>
          <div className="text-sm text-gray-600">Points Earned</div>
        </div>
      </div>

      {/* How it Works */}
      <div className="bg-blue-50 rounded-2xl border border-blue-100 p-6">
        <h4 className="font-bold text-blue-900 mb-4">How It Works</h4>
        <ol className="space-y-2 text-sm text-blue-800">
          <li className="flex gap-2">
            <span className="font-bold">1.</span>
            <span>Share your referral link with other businesses</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold">2.</span>
            <span>They sign up using your link</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold">3.</span>
            <span>Get 1 referral credit for each business that joins</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold">4.</span>
            <span>Reach 30 referrals to get 12 months free subscription</span>
          </li>
        </ol>
      </div>
    </div>
  );
};

export default ReferralProgram;
