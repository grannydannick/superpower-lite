import { useLocation } from 'react-router';

import { useUser } from '@/lib/auth';
import { useAuthorization } from '@/lib/authorization';

import { useGetConsent } from '../api';

export const useNeedsMembershipConsent = () => {
  const { pathname } = useLocation();
  const { checkAdminActorAccess } = useAuthorization();
  const { data: user } = useUser();

  const isAdmin = checkAdminActorAccess();
  const { data, isLoading } = useGetConsent({ userId: user?.id || '' });

  const disabledByRoute = pathname.includes('onboarding');

  const shouldShow =
    !isLoading && !isAdmin && !disabledByRoute && data?.exists === false;
  return { needsConsent: shouldShow, isLoading };
};
