import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WelcomeSequenceStore {
  hasSeenWelcome: boolean;
  dismissWelcome: () => void;
  reset: () => void;
}

export const useWelcomeSequenceStore = create<WelcomeSequenceStore>()(
  persist(
    (set) => ({
      hasSeenWelcome: false,
      dismissWelcome: () => set({ hasSeenWelcome: true }),
      reset: () => set({ hasSeenWelcome: false }),
    }),
    {
      name: 'onboarding:welcome-sequence',
    },
  ),
);
