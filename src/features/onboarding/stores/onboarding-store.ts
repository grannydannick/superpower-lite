import { create } from 'zustand';

import { SubscriptionType } from '@/types/api';

type OnboardingStore = {
  isZipBlocked: boolean;
  setIsZipBlocked: (isZipBlocked: boolean) => void;
  processing: boolean;
  setProcessing: (processing: boolean) => void;
  consentGiven: boolean;
  setConsentGiven: (consentGiven: boolean) => void;
  membershipType: SubscriptionType;
  updateMembershipType: (membershipType: SubscriptionType) => void;
};

export const useOnboarding = create<OnboardingStore>()((set) => ({
  isZipBlocked: false,
  setIsZipBlocked: (isZipBlocked) => set({ isZipBlocked }),
  processing: false,
  setProcessing: (processing) => set({ processing }),
  consentGiven: false,
  setConsentGiven: (consentGiven) => set({ consentGiven }),
  membershipType: 'baseline',
  updateMembershipType: (membershipType) => set({ membershipType }),
}));
