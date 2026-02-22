import type { Properties } from 'posthog-js';
import { useCallback } from 'react';

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
  hdyhau_category?: string;
  hdyhau_option?: string;
};

export type TrackProperties = Properties & {
  $set?: PersonProperties;
  $set_once?: PersonProperties;
};

export const useAnalytics = () => {
  /**
   * https://posthog.com/docs/getting-started/send-events#sending-custom-properties-on-an-event
   * @param eventName The name of the event to track
   * @param properties Optional properties to attach to the event. Use `$set` for properties that should be set on the user profile, and `$set_once` for properties that should only be set once.
   * @returns
   */
  const track = useCallback(
    (eventName: string, properties?: TrackProperties) => {
      const client = typeof window === 'undefined' ? undefined : window.posthog;
      if (client != null) {
        client.capture(eventName, properties);
      }

      captureEvent(eventName, properties ?? {});
    },
    [],
  );

  /**
   * https://posthog.com/docs/getting-started/identify-users
   * @param userId (Optional) The ID of the user. If not provided, PostHog will use an anonymous ID.
   * @param properties (Optional) Properties to set on the user profile. Use `$set` for properties that should be set on the user profile, and `$set_once` for properties that should only be set once.
   * @returns
   */
  const identify = useCallback(
    (
      userId?: string,
      properties?: {
        $set?: PersonProperties;
        $set_once?: PersonProperties;
      },
    ): void => {
      const client = typeof window === 'undefined' ? undefined : window.posthog;
      if (client != null) {
        client.identify(userId, properties?.$set, properties?.$set_once);
      }

      captureEvent('identify', { user_id: userId, ...properties });
    },
    [],
  );

  const reset = useCallback(() => {
    const client = typeof window === 'undefined' ? undefined : window.posthog;
    if (client != null) {
      client.reset();
    }

    captureEvent('reset', {});
  }, []);

  return {
    track,
    identify,
    reset,
  };
};
