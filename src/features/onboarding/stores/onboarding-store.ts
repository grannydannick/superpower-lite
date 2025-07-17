import { create } from 'zustand';

import { AvailableSubscription } from '@/types/api';
import { getAccessCode, setManualCouponOverride } from '@/utils/access-code';

type OnboardingStore = {
  consentGiven: boolean;
  setConsentGiven: (consentGiven: boolean) => void;
  processing: boolean;
  setProcessing: (processing: boolean) => void;
  membership: AvailableSubscription | null;
  updateMembership: (membershipType: AvailableSubscription | null) => void;
  showAccessCode: boolean;
  setShowAccessCode: (show: boolean) => void;
  coupon: string | null;
  setCoupon: (coupon: string | null) => void;
};

export const useOnboarding = create<OnboardingStore>()((set) => ({
  consentGiven: false,
  setConsentGiven: (consentGiven) => set({ consentGiven }),
  processing: false,
  setProcessing: (processing) => set({ processing }),
  membership: null,
  updateMembership: (membership) => {
    console.warn(`Updated membership to ${JSON.stringify(membership)}`);
    set({ membership });
  },
  showAccessCode: false,
  setShowAccessCode: (show) => set({ showAccessCode: show }),
  coupon: getAccessCode(),
  setCoupon: (coupon) => {
    set({ coupon });
    if (coupon) {
      // set manual coupon override to be accessible in all getAccessCode() calls
      // this would save it into sessionstorage
      setManualCouponOverride(coupon);
    }
  },
}));
