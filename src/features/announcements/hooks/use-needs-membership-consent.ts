import { useRouterState } from '@tanstack/react-router';

import { useUser } from '@/lib/auth';
import { useAuthorization } from '@/lib/authorization';

import { useGetConsent } from '../api';

export const useNeedsMembershipConsent = () => {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { checkAdminActorAccess } = useAuthorization();
  const { data: user } = useUser();

  const isAdmin = checkAdminActorAccess();
  const disabledByRoute = pathname.includes('onboarding');
  const userId = user?.id ?? '';
  const shouldFetch = !isAdmin && !disabledByRoute && userId.length > 0;
  const { data, isLoading } = useGetConsent({
    userId,
    queryConfig: {
      enabled: shouldFetch,
    },
  });

  const shouldShow =
    !isLoading && !isAdmin && !disabledByRoute && data?.exists === false;
  return { needsConsent: shouldShow, isLoading: shouldFetch && isLoading };
};
