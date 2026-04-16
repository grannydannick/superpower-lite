import { useRouterState } from '@tanstack/react-router';

import { useUser } from '@/lib/auth';
import { ConsentType } from '@/types/api';

import { useGetConsent } from '../api';

export const useNeedsPhiMarketingConsent = () => {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { data: user } = useUser();
  const disabledByRoute = pathname.includes('onboarding');
  const userId = user?.id ?? '';
  const shouldFetch = !disabledByRoute && userId.length > 0;
  const { data, isLoading } = useGetConsent({
    userId,
    type: ConsentType.PHI_MARKETING,
    queryConfig: {
      enabled: shouldFetch,
    },
  });

  const shouldShow = !isLoading && !disabledByRoute && data?.exists === false;
  return { needsConsent: shouldShow, isLoading: shouldFetch && isLoading };
};
