import { create } from 'zustand';

import { SubscriptionType } from '@/types/api';

type OnboardingStore = {
  processing: boolean;
  setProcessing: (processing: boolean) => void;
  consentGiven: boolean;
  setConsentGiven: (consentGiven: boolean) => void;
  membershipType: SubscriptionType;
  updateMembershipType: (membershipType: SubscriptionType) => void;
};

export const useOnboarding = create<OnboardingStore>()((set) => ({
  processing: false,
  setProcessing: (processing) => set({ processing }),
  consentGiven: false,
  setConsentGiven: (consentGiven) => set({ consentGiven }),
  membershipType: 'baseline',
  updateMembershipType: (membershipType) => set({ membershipType }),
}));
