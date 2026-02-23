import { useUser } from '@/lib/auth';

export const useInviteLink = () => {
  const { data: user } = useUser();
  if (user === undefined) return { link: '' };
  return { link: `https://app.superpower.com/register?invite=${user.id}` };
};
