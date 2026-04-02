import { domMax, LazyMotion, MotionConfig } from 'framer-motion';
import * as React from 'react';
import { createRoot } from 'react-dom/client';

import './index.css';
import { initSentry, Sentry } from '@/lib/sentry';
import { captureCampaignParameters } from '@/utils/campaign-tracking';

import { App } from './app';

const root = document.getElementById('root');
if (!root) throw new Error('No root element found');

initSentry();

// Initialize campaign tracking immediately since this is a client-side app
captureCampaignParameters();

const bootstrap = async () => {
  if (import.meta.env.DEV) {
    try {
      const [{ scan }, { enableMocking }] = await Promise.all([
        import('react-scan'),
        import('./testing/mocks'),
      ]);

      scan({ enabled: true });
      await enableMocking();
    } catch {
      // ignore – dev tooling is non-critical
    }
  }

  createRoot(root, {
    onCaughtError(error, errorInfo) {
      console.error(error);
      Sentry.captureException(error, {
        extra: { componentStack: errorInfo.componentStack },
      });
    },
    onUncaughtError(error, errorInfo) {
      console.error(error);
      Sentry.captureException(error, {
        extra: { componentStack: errorInfo.componentStack },
      });
    },
  }).render(
    <React.StrictMode>
      <MotionConfig reducedMotion="user">
        <LazyMotion features={domMax}>
          <App />
        </LazyMotion>
      </MotionConfig>
    </React.StrictMode>,
  );
};

void bootstrap();
