import { Properties } from 'posthog-js';
import { usePostHog } from 'posthog-js/react';

import { captureEvent } from '@/lib/gtm';

export type PersonProperties = {
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  city?: string;
  postal_code?: string;
  state?: string;
  country?: string;
  stripe_id?: string;
  gender?: string;
  /**
   * The user's birthday in ISO format (YYYY-MM-DD).
   */
  birthday?: string;
  birthday_year?: number;
};

export type TrackProperties = Properties & {
  $set?: PersonProperties;
  $set_once?: PersonProperties;
};

export const useAnalytics = () => {
  const posthog = usePostHog();

  /**
   * https://posthog.com/docs/getting-started/send-events#sending-custom-properties-on-an-event
   * @param eventName The name of the event to track
   * @param properties Optional properties to attach to the event. Use `$set` for properties that should be set on the user profile, and `$set_once` for properties that should only be set once.
   * @returns
   */
  const track = (eventName: string, properties?: TrackProperties) => {
    if (posthog) {
      posthog.capture(eventName, properties);
    }

    captureEvent(eventName, properties || {});
  };

  /**
   * https://posthog.com/docs/getting-started/identify-users
   * @param userId (Optional) The ID of the user. If not provided, PostHog will use an anonymous ID.
   * @param properties (Optional) Properties to set on the user profile. Use `$set` for properties that should be set on the user profile, and `$set_once` for properties that should only be set once.
   * @returns
   */
  const identify = (
    userId?: string,
    properties?: {
      $set?: PersonProperties;
      $set_once?: PersonProperties;
    },
  ): void => {
    if (posthog) {
      posthog.identify(userId, properties?.$set, properties?.$set_once);
    }

    captureEvent('identify', { user_id: userId, ...properties });
  };

  const reset = () => {
    if (posthog) {
      posthog.reset();
    }

    captureEvent('reset', {});
  };

  return {
    track,
    identify,
    reset,
  };
};
