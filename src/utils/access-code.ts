export const updateAccessCode = (accessCode: string) => {
  localStorage.setItem('superpower-code', accessCode.trim());
};

export const getAccessCode = () => {
  // First check for Rewardful coupon in window object
  const rewardfulCoupon = (window as any)?.Rewardful?.coupon?.id;
  if (rewardfulCoupon) {
    return rewardfulCoupon.trim();
  }

  // Fall back to localStorage
  return localStorage.getItem('superpower-code')?.trim();
};
