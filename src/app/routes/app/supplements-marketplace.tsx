import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { SUPPLEMENTS_MARKETPLACE_URL } from '@/const/marketplaces';
import { useGetMultipassUrl } from '@/features/shop/api/get-multipass-url';
import { useUser } from '@/lib/auth';
import { isMobile } from '@/utils/browser-detection';

export const SupplementsMarketplaceRoute = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: user } = useUser();
  const { data: multipassData, isLoading } = useGetMultipassUrl();

  // Detect if user is on mobile
  const isMobileDevice = isMobile();

  useEffect(() => {
    // If user is signed in and multipass URL is available, redirect to the multipass URL
    if (multipassData?.url) {
      if (isMobileDevice) {
        // On mobile, redirect directly to the URL instead of opening in new tab
        window.location.href = multipassData.url;
      } else {
        // On desktop, open supplements marketplace in a new tab
        window.open(multipassData.url, '_blank', 'noopener,noreferrer');
        // Redirect back to previous route or root if came directly to /supplements
        const previousPath = location.state?.from || '/';
        navigate(previousPath, { replace: true });
      }
    } else if (!isLoading) {
      // If multipass URL is not available (and not loading), fallback to the default supplements marketplace URL
      if (isMobileDevice) {
        // On mobile, redirect directly to the URL instead of opening in new tab
        window.location.href = SUPPLEMENTS_MARKETPLACE_URL;
      } else {
        // On desktop, open supplements marketplace in a new tab
        window.open(
          SUPPLEMENTS_MARKETPLACE_URL,
          '_blank',
          'noopener,noreferrer',
        );
        // Redirect back to previous route or root if came directly to /supplements
        const previousPath = location.state?.from || '/';
        navigate(previousPath, { replace: true });
      }
    }
  }, [
    user,
    navigate,
    multipassData,
    isLoading,
    location.state,
    isMobileDevice,
  ]);

  return null;
};
