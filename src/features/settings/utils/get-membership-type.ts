import { Subscription } from '@/types/api';

export const getMembershipType = (
  subscription?: Subscription,
): 'Baseline Membership' | 'Advanced Membership' | undefined => {
  if (!subscription) {
    return undefined;
  }

  if (!subscription.type) {
    return undefined;
  }

  switch (subscription.type) {
    case 'baseline':
      return 'Baseline Membership';
    case 'advanced':
      return 'Advanced Membership';
  }
};
