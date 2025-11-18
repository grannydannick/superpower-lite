import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import '@/features/homepage/cards/config';
import { cardRegistry } from '../registry/card-registry';
import { HomepageState, VisibleCard } from '../types';

interface HomepageStore {
  getVisibleCards: (state: HomepageState) => VisibleCard[];
}
export const useHomepageStore = create<HomepageStore>()(
  devtools(
    () => ({
      getVisibleCards: (state: HomepageState) => {
        return cardRegistry.getVisibleCards(state);
      },
    }),
    { name: 'HomepageStore' },
  ),
);
