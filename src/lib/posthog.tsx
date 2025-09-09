import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import React from 'react';

import { env } from '@/config/env';

import { useUser } from './auth';

const phClient = env.POSTHOG_KEY
  ? posthog.init(env.POSTHOG_KEY, {
      api_host: env.POSTHOG_HOST,
      ui_host: env.POSTHOG_UI_HOST,
      defaults: '2025-05-24',
      debug: env.POSTHOG_DEBUG === 'true',
      person_profiles: 'always',
      session_recording: {
        maskTextSelector: '*',
        maskAllInputs: true,
      },
      opt_in_site_apps: true,
    })
  : null;

export function PHProvider({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const user = useUser();
  const identified = React.useRef(null as string | null);
  React.useEffect(() => {
    if (!phClient) {
      return;
    }
    if (user.data && identified.current !== user.data.id) {
      identified.current = user.data.id;
      phClient.identify(user.data.id, {
        email: user.data.email,
        first_name: user.data.firstName,
        last_name: user.data.lastName,
        phone: user.data.phone,
      });
    }
  }, [user.data]);

  if (!phClient) {
    return <>{children}</>;
  }

  return <PostHogProvider client={phClient}>{children}</PostHogProvider>;
}
