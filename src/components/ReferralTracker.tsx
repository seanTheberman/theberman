import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

/**
 * ReferralTracker component
 * Detects '?ref=business-slug' in the URL, resolves it to a listing ID,
 * and stores it in localStorage for attribution during assessment creation.
 */
const ReferralTracker = () => {
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const refSlug = searchParams.get('ref');

    if (refSlug) {
      const resolveReferral = async () => {
        try {
          // Resolve the slug to a listing ID
          const { data, error } = await supabase
            .from('catalogue_listings')
            .select('id')
            .eq('slug', refSlug)
            .single();

          if (error) {
            console.error('Error resolving referral slug:', error);
            return;
          }

          if (data && data.id) {
            // Store the referral ID in localStorage with a timestamp
            const referralData = {
              listingId: data.id,
              slug: refSlug,
              timestamp: Date.now()
            };
            
            localStorage.setItem('last_referral', JSON.stringify(referralData));
            console.log('Referral tracked successfully:', refSlug);
          }
        } catch (err) {
          console.error('Unexpected error in ReferralTracker:', err);
        }
      };

      resolveReferral();
    }
  }, [location]);

  return null; // This component doesn't render anything
};

export default ReferralTracker;
