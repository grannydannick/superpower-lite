import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type BloodPackageType = 'BASELINE' | 'ADVANCED';

type OnboardingStore = {
  isZipBlocked: boolean;
  setIsZipBlocked: (isZipBlocked: boolean) => void;
  processing: boolean;
  setProcessing: (processing: boolean) => void;
  consentGiven: boolean;
  setConsentGiven: (consentGiven: boolean) => void;
  bloodPackage: BloodPackageType | null;
  updateBloodPackage: (bloodPackage: BloodPackageType) => void;
};

export const useOnboarding = create<OnboardingStore>()(
  persist(
    (set) => ({
      isZipBlocked: false,
      setIsZipBlocked: (isZipBlocked) => set({ isZipBlocked }),
      processing: false,
      setProcessing: (processing) => set({ processing }),
      consentGiven: false,
      setConsentGiven: (consentGiven) => set({ consentGiven }),
      bloodPackage: 'BASELINE',
      updateBloodPackage: (bloodPackage) => set({ bloodPackage }),
    }),
    { name: 'onboarding' },
  ),
);
