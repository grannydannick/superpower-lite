import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type OnboardingMilestone =
  | 'hasSeenWelcome'
  | 'hasSeenGiftUpsell'
  | 'hasAnsweredHeardAboutUs';

type UserProgress = Partial<Record<OnboardingMilestone, boolean>>;

interface OnboardingProgressStore {
  progressByUser: Record<string, UserProgress>;
  setProgress: (
    userId: string,
    milestone: OnboardingMilestone,
    value: boolean,
  ) => void;
  resetUser: (userId: string) => void;
}

const useOnboardingProgressStore = create<OnboardingProgressStore>()(
  persist(
    (set) => ({
      progressByUser: {},
      setProgress: (userId, milestone, value) =>
        set((state) => ({
          progressByUser: {
            ...state.progressByUser,
            [userId]: { ...state.progressByUser[userId], [milestone]: value },
          },
        })),
      resetUser: (userId) =>
        set((state) => {
          const next = { ...state.progressByUser };
          delete next[userId];
          return { progressByUser: next };
        }),
    }),
    { name: 'onboarding:progress' },
  ),
);

export const useOnboardingProgress = (
  userId: string | undefined,
  milestone: OnboardingMilestone,
) =>
  useOnboardingProgressStore((state) => {
    if (userId == null) return false;
    return state.progressByUser[userId]?.[milestone] === true;
  });

export const setOnboardingProgress = (
  userId: string,
  milestone: OnboardingMilestone,
  value: boolean,
) =>
  useOnboardingProgressStore.getState().setProgress(userId, milestone, value);
