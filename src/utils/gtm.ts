import { RewardfulWindow } from '@/types/window';
import { getAccessCode } from '@/utils/access-code';

export const trackSubscription = (price: number | undefined) => {
  try {
    // We'll handle this server-side, keeping only GTM for now
    const win = window as RewardfulWindow;

    const trackingInfo = {
      event: 'subscription',
      value: price ?? 49900,
      referralId: win.Rewardful?.referral || null,
      rewardfulCode: win.Rewardful?.coupon || null,
      accessCode: getAccessCode(),
    };

    if (win.dataLayer) {
      win.dataLayer.push(trackingInfo);
      // console.log(`tracked subscription with ${JSON.stringify(trackingInfo)}`);
    }
  } catch (error) {
    console.error('GTM tracking failed:', error);
  }
};
