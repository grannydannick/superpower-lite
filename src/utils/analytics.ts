import { RewardfulWindow } from '@/types/window';

import { getAccessCode } from './access-code';

// Type definition for the analytics object injected by Segment
interface AnalyticsWindow extends Window {
  analytics?: {
    track: (event: string, properties?: Record<string, any>) => void;
    identify: (userId: string, traits?: Record<string, any>) => void;
    page: (
      category?: string,
      name?: string,
      properties?: Record<string, any>,
    ) => void;
    alias: (aliasId: string, userId: string) => void;
    user?: {
      anonymousId?: () => string;
    };
  };
}

/**
 * Track an event using Segment analytics
 */
export const trackEvent = (
  eventName: string,
  properties?: Record<string, any>,
): void => {
  try {
    const win = window as AnalyticsWindow & RewardfulWindow;
    if (!win.analytics) {
      console.warn('Segment analytics not available');
      return;
    }

    // Add common properties to all events
    const commonProps = {
      referralId: win.Rewardful?.referral || null,
      rewardfulCode: win.Rewardful?.coupon?.id || null,
      accessCode: getAccessCode() || null,
    };

    // Track the event with Segment
    win.analytics.track(eventName, {
      ...properties,
      ...commonProps,
    });
    // console.log(
    //   `tracked Segment event ${eventName} with ${JSON.stringify({
    //     ...properties,
    //     ...commonProps,
    //   })}`,
    // );

    // Also track with GTM during transition period
    if (win.dataLayer) {
      const rewardfulProperties = {
        event: eventName,
        value: properties?.value || 0, // Ensure value is always provided for GTM
        referralId: win.Rewardful?.referral || null,
        ...properties,
      };

      win.dataLayer.push(rewardfulProperties);

      // console.log(
      //   `tracked Rewardful event ${eventName} with ${JSON.stringify(rewardfulProperties)}`,
      // );
    }
  } catch (error) {
    console.error('Analytics tracking failed:', error);
  }
};

/**
 * Identify a user in Segment
 */
export const identifyUser = (
  userId: string,
  traits?: Record<string, any>,
): void => {
  try {
    const win = window as AnalyticsWindow;
    if (!win.analytics) {
      console.warn('Segment analytics not available');
      return;
    }

    // Get the anonymous ID before identifying
    const anonymousId = win.analytics.user?.anonymousId?.();

    // First alias the anonymous ID with the user ID for Mixpanel
    if (anonymousId) {
      win.analytics.alias(userId, anonymousId);
    }

    // Then identify the user with their traits
    win.analytics.identify(userId, traits);
  } catch (error) {
    console.error('Analytics identify failed:', error);
  }
};

/**
 * Track a page view in Segment
 */
export const trackPageView = (
  category?: string,
  name?: string,
  properties?: Record<string, any>,
): void => {
  try {
    const win = window as AnalyticsWindow;
    if (!win.analytics) {
      console.warn('Segment analytics not available');
      return;
    }

    win.analytics.page(category, name, properties);
  } catch (error) {
    console.error('Analytics page tracking failed:', error);
  }
};
