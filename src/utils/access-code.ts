import { getPartnerData } from './dub';

// Store manual coupon override in sessionStorage
export const setManualCouponOverride = (
  accessCode: string,
  metadata?: Record<string, string>,
) => {
  let finalMetadata = metadata;
  if (!metadata) {
    try {
      const existing = sessionStorage.getItem('superpower-manual-coupon');
      if (existing) {
        const parsed = JSON.parse(existing);
        if (parsed.metadata) {
          finalMetadata = parsed.metadata;
        }
      }
    } catch (error) {
      console.warn('Failed to parse existing coupon metadata:', error);
    }
  }

  const override = {
    code: accessCode.trim(),
    timestamp: Date.now(),
    metadata: finalMetadata,
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

/**
 * 1. Check the URL for a coupon code (code=)
 * 2. Check sessionStorage for a manually set coupon code
 * 3. Check for a Dub.co partner coupon code in cookies
 * @returns The coupon or null if none found
 */
export const getAccessCode = (): string | null => {
  // 1. Check URL for coupon code
  const params = new URLSearchParams(window.location.search);
  const urlCode = params.get('code');
  if (urlCode) {
    console.warn(`URL coupon ${urlCode} used`);
    setManualCouponOverride(urlCode);
    return urlCode;
  }

  // 2. Check sessionStorage for manually set coupon code
  const manualOverride = getManualCouponOverride();
  if (manualOverride && manualOverride !== '$') {
    console.warn(`Manual override coupon ${manualOverride} used`);
    return manualOverride;
  }

  // 3. Get dub.co partner coupon if exists
  const dubCookie = getPartnerData();
  if (dubCookie?.discount?.couponId && process.env.NODE_ENV === 'production') {
    console.log(`coupon ${dubCookie.discount.couponId} used`);
    return dubCookie.discount.couponId;
  } else if (
    dubCookie?.discount?.couponTestId &&
    process.env.NODE_ENV !== 'production'
  ) {
    console.log(`test coupon ${dubCookie.discount.couponTestId} used`);
    return dubCookie.discount.couponTestId;
  }

  return null;
};

// Check if the current coupon is an event draw coupon
export const isEventDrawCoupon = (): boolean => {
  try {
    const stored = sessionStorage.getItem('superpower-manual-coupon');
    if (stored) {
      const override = JSON.parse(stored);
      return override.metadata?.event_type === 'event_draw';
    }
  } catch (error) {
    clearManualCouponOverride();
  }
  return false;
};

// Get event draw metadata from the current coupon
export const getEventDrawMetadata = (): Record<string, string> | null => {
  try {
    const stored = sessionStorage.getItem('superpower-manual-coupon');
    if (stored) {
      const override = JSON.parse(stored);
      return override.metadata || null;
    }
  } catch (error) {
    clearManualCouponOverride();
  }
  return null;
};
