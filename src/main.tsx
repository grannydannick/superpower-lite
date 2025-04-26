import * as React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { scan } from 'react-scan';

import { env } from '@/config/env';
import { captureCampaignParameters } from '@/utils/campaign-tracking';

import { App } from './app';
import { enableMocking } from './testing/mocks';

// react scan
scan({
  enabled: process.env.NODE_ENV === 'development',
});

const root = document.getElementById('root');
if (!root) throw new Error('No root element found');

/**
 * This values can be found if you go to:
 *
 * New relic => Browser => Application Settings => Find "Snippet Code" on the right
 * You will find there something like:
 *
 * <script type="text/javascript">
 * ;window.NREUM||(NREUM={});NREUM.init={...
 *
 * You need to take NREUM.init, NREUM.info and NREUM.loader_config and replace values that you need in doppler
 *
 * For session replay rates, adjust manually
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const options = {
  init: {
    session_replay: {
      enabled: true,
      block_selector: '',
      // P.S. if you have * here, all fields like h1, h2, p, etc will be replaced with *
      mask_text_selector: '',
      sampling_rate: 100.0,
      error_sampling_rate: 100.0,
      // P.S. if you have true here, all inputs on replay will be masked with ***
      mask_all_inputs: false,
      collect_fonts: true,
      inline_images: true,
      inline_stylesheet: true,
      mask_input_options: {},
    },
    distributed_tracing: { enabled: true },
    privacy: { cookies_enabled: true },
    ajax: { deny_list: ['bam.nr-data.net'] },
  }, // NREUM.init
  info: {
    beacon: 'bam.nr-data.net',
    errorBeacon: 'bam.nr-data.net',
    licenseKey: env.NEW_RELIC_INFO_LICENSE_KEY,
    applicationID: env.NEW_RELIC_INFO_APPLICATION_ID,
    sa: 1,
  }, // NREUM.info
  loader_config: {
    accountID: env.NEW_RELIC_LOADER_ACCOUNT_ID,
    trustKey: env.NEW_RELIC_LOADER_TRUST_KEY,
    agentID: env.NEW_RELIC_LOADER_AGENT_ID,
    licenseKey: env.NEW_RELIC_LOADER_LICENSE_KEY,
    applicationID: env.NEW_RELIC_LOADER_APPLICATION_ID,
  }, // NREUM.loader_config
};

// NOTE: disabled on Apr 25 2025 due to the fact it kills performance of the app and it sucks
// new BrowserAgent(options);

// Initialize campaign tracking immediately since this is a client-side app
captureCampaignParameters();

enableMocking().then(() => {
  createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
});
