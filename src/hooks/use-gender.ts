import { useUser } from '@/lib/auth';

export const useGender = () => {
  const { data: user, isLoading } = useUser();

  const gender = user?.gender?.toLowerCase() as 'male' | 'female' | undefined;

  return { gender, isLoading };
};
