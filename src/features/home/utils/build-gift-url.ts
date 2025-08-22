import { User } from '@/types/api';

export const buildGiftUrl = (user?: User | null): string => {
  const baseUrl = 'https://superpower.com/gift-superpower';

  if (!user?.firstName || !user?.lastName || !user?.email) {
    return baseUrl;
  }

  const params = new URLSearchParams({
    first_name: user.firstName,
    last_name: user.lastName,
    email: user.email,
  });

  return `${baseUrl}?${params.toString()}`;
};
