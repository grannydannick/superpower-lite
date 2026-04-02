import * as Sentry from '@sentry/react';
import {
  breadcrumbsIntegration,
  browserTracingIntegration,
  consoleLoggingIntegration,
  thirdPartyErrorFilterIntegration,
} from '@sentry/react';

import { env } from '@/config/env';

const BASE_TRACES_SAMPLE_RATE = 0.2;

export function initSentry() {
  if (!env.SENTRY_DSN || import.meta.env.TEST) return;

  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.APP_ENV,
    // release is automatically injected by @sentry/vite-plugin at build time
    sendDefaultPii: true,
    tracesSampleRate: 1.0,
    enableLogs: true,
    tracePropagationTargets: [
      'localhost',
      /^https:\/\/api\.superpower\.com/,
      /^https:\/\/api\.superpower-staging\.com/,
    ],
    integrations: [
      browserTracingIntegration(),
      breadcrumbsIntegration(),
      consoleLoggingIntegration(),
      thirdPartyErrorFilterIntegration({
        filterKeys: ['superpower-react-app'],
        behaviour: 'drop-error-if-exclusively-contains-third-party-frames',
      }),
    ],
    beforeBreadcrumb(breadcrumb) {
      if (
        env.POSTHOG_HOST &&
        (breadcrumb.category === 'fetch' || breadcrumb.category === 'xhr')
      ) {
        try {
          const url = new URL(String(breadcrumb.data?.url ?? ''));
          if (url.hostname === new URL(env.POSTHOG_HOST).hostname) {
            return null;
          }
        } catch {
          // unparseable URL — let the breadcrumb through
        }
      }
      return breadcrumb;
    },
    beforeSendTransaction(event) {
      // Always capture error transactions
      const statusCode = event.contexts?.response?.status_code as
        | number
        | undefined;
      if (statusCode && statusCode >= 500) return event;
      if (event.contexts?.trace?.status === 'internal_error') return event;

      // Deterministic sampling for the rest
      const traceId = event.contexts?.trace?.trace_id ?? '';
      const hash = traceId
        .split('')
        .reduce((acc, c) => acc + c.charCodeAt(0), 0);
      if (hash % 100 < BASE_TRACES_SAMPLE_RATE * 100) return event;

      return null;
    },
  });
}

export { Sentry };
