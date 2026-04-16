import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GiftUpsellStore {
  hasSeenGiftUpsell: boolean;
  dismissGiftUpsell: () => void;
  reset: () => void;
}

export const useGiftUpsellStore = create<GiftUpsellStore>()(
  persist(
    (set) => ({
      hasSeenGiftUpsell: false,
      dismissGiftUpsell: () => set({ hasSeenGiftUpsell: true }),
      reset: () => set({ hasSeenGiftUpsell: false }),
    }),
    {
      name: 'onboarding:gift-upsell',
    },
  ),
);
