// Store manual coupon override in sessionStorage
export const setManualCouponOverride = (accessCode: string) => {
  const override = {
    code: accessCode.trim(),
    timestamp: Date.now(),
  };
  sessionStorage.setItem('superpower-manual-coupon', JSON.stringify(override));
};

// Clear manual coupon override
export const clearManualCouponOverride = () => {
  sessionStorage.removeItem('superpower-manual-coupon');
};

// Get manual coupon override from sessionStorage
const getManualCouponOverride = () => {
  try {
    const stored = sessionStorage.getItem('superpower-manual-coupon');
    if (stored) {
      const override = JSON.parse(stored);
      return override.code;
    }
  } catch (error) {
    // Invalid JSON, clear it
    clearManualCouponOverride();
  }
  return null;
};

export const getAccessCode = (): string | null => {
  const manualOverride = getManualCouponOverride();
  if (manualOverride && manualOverride !== '$') {
    console.warn(`Manual override coupon ${manualOverride} used`);
    return manualOverride;
  }
  // check if rewardful exists otherwise return null
  const rewardfulCoupon = (window as any)?.Rewardful?.coupon?.id;
  if (rewardfulCoupon && rewardfulCoupon.trim() !== '$') {
    console.warn(`Rewardful coupon ${rewardfulCoupon} used`);
    return rewardfulCoupon.trim();
  }

  return null;
};
