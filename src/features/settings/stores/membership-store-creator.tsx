import { differenceInCalendarDays } from 'date-fns';
import { createStore } from 'zustand';

import { Subscription } from '@/types/api';

export interface MembershipProps {
  subscription: Subscription;
}

export interface MembershipStore extends MembershipProps {
  startDate: Date;
  endDate: Date;
  daysRemaining: number;
}

export type MembershipStoreApi = ReturnType<typeof membershipStoreCreator>;

export const membershipStoreCreator = (
  initProps?: Partial<MembershipStore>,
) => {
  const subscription = initProps?.subscription;

  if (!subscription) {
    throw new Error('Subscription is not defined');
  }

  const endDate = new Date(subscription.current_period_end * 1000);
  const startDate = new Date(subscription.current_period_start * 1000);
  const today = new Date();
  const daysRemaining = differenceInCalendarDays(endDate, today);

  return createStore<MembershipStore>()(() => ({
    subscription,
    startDate: startDate,
    endDate: endDate,
    daysRemaining: daysRemaining,
  }));
};
