import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';

import { useLogout } from '@/lib/auth';
import { clearActiveLogin } from '@/lib/utils';

export const LogoutRoute = () => {
  const logout = useLogout();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    logout.mutate({});
    navigate('/signin');

    // kill access / refresh tokens so user wont be refetched immidiately
    clearActiveLogin();
    // needed to remove all previous user queries and refetch for the new one
    queryClient.removeQueries();
  }, []);

  return null;
};
