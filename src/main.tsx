import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { scan } from 'react-scan';

import './index.css';
import { captureCampaignParameters } from '@/utils/campaign-tracking';

import { App } from './app';
import { enableMocking } from './testing/mocks';

// react scan
scan({
  enabled: import.meta.env.DEV,
});

const root = document.getElementById('root');
if (!root) throw new Error('No root element found');

// Initialize campaign tracking immediately since this is a client-side app
captureCampaignParameters();

enableMocking().then(() => {
  createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
});
