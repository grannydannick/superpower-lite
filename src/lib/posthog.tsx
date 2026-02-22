import type { PostHog } from 'posthog-js';
import React from 'react';

import { env } from '@/config/env';

import { useUser } from './auth';

const shouldEnablePosthog =
  typeof env.POSTHOG_KEY === 'string' && env.POSTHOG_KEY.length > 0;

function startPosthogInit(
  initPromiseRef: React.MutableRefObject<Promise<PostHog | null> | null>,
) {
  if (!shouldEnablePosthog) {
    return null;
  }
  if (typeof window === 'undefined') {
    return null;
  }
  if (initPromiseRef.current) {
    return initPromiseRef.current;
  }

  const posthogKey = env.POSTHOG_KEY;
  if (typeof posthogKey !== 'string' || posthogKey.length === 0) {
    return null;
  }

  initPromiseRef.current = import('posthog-js')
    .then((mod) => {
      const posthog = mod.default;
      posthog.init(posthogKey, {
        api_host: env.POSTHOG_HOST,
        ui_host: env.POSTHOG_UI_HOST,
        defaults: '2025-05-24',
        debug: env.POSTHOG_DEBUG === 'true',
        person_profiles: 'always',
        session_recording: {
          maskInputOptions: {
            password: true,
          },
        },
        opt_in_site_apps: true,
      });
      window.posthog = posthog;
      window.dispatchEvent(new CustomEvent('posthog:ready'));
      return posthog;
    })
    .catch((error: unknown) => {
      console.error('PostHog init failed', error);
      initPromiseRef.current = null;
      return null;
    });

  return initPromiseRef.current;
}

export function PHProvider({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const user = useUser();
  const identified = React.useRef(null as string | null);
  const initPromiseRef = React.useRef<Promise<PostHog | null> | null>(null);

  React.useEffect(() => {
    if (!shouldEnablePosthog) {
      return;
    }

    if (typeof window === 'undefined') {
      return;
    }

    if (typeof window.requestIdleCallback === 'function') {
      const idleId = window.requestIdleCallback(
        () => startPosthogInit(initPromiseRef),
        { timeout: 2000 },
      );
      return () => window.cancelIdleCallback(idleId);
    }

    const timeoutId = window.setTimeout(
      () => startPosthogInit(initPromiseRef),
      1000,
    );
    return () => window.clearTimeout(timeoutId);
  }, []);

  React.useEffect(() => {
    if (!shouldEnablePosthog) {
      return;
    }

    const userData = user.data;
    if (!userData) {
      return;
    }

    if (identified.current === userData.id) {
      return;
    }

    const maybePromise = startPosthogInit(initPromiseRef);
    if (maybePromise == null) {
      return;
    }

    const userId = userData.id;
    void maybePromise.then((client) => {
      if (!client) {
        return;
      }
      try {
        client.identify(userId, {
          email: userData.email,
          first_name: userData.firstName,
          last_name: userData.lastName,
          phone: userData.phone,
        });
        identified.current = userId;
      } catch (error: unknown) {
        console.error('PostHog identify failed', error);
      }
    });
  }, [user.data]);

  return <>{children}</>;
}

export const FeatureFlags = {
  ProtocolAutopilot: 'protocol-autopilot-nov-2025',
};
