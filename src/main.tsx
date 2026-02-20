import * as React from 'react';
import { createRoot } from 'react-dom/client';

import './index.css';
import { captureCampaignParameters } from '@/utils/campaign-tracking';

import { App } from './app';

const root = document.getElementById('root');
if (!root) throw new Error('No root element found');

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

  createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
};

void bootstrap();
