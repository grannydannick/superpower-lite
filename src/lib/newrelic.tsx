// @ts-expect-error: New relic types could not be resolved under current moduleResolution setting, so we ignore them for now
import { BrowserAgent } from '@newrelic/browser-agent';
import React, { useEffect, useRef } from 'react';

import { env } from '@/config/env';
import { useUser } from '@/lib/auth';

type NewRelicProviderProps = {
  children: React.ReactNode;
};

export const NewRelicProvider = ({ children }: NewRelicProviderProps) => {
  const { data: user } = useUser();
  const agentRef = useRef<BrowserAgent | null>(null);

  useEffect(() => {
    if (!agentRef.current) {
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

      /**
       * The agent loader code executes immediately on instantiation.
       *
       * To verify its working open console in browser and type newrelic,
       * you should be able to see an object here with all data
       */
      agentRef.current = new BrowserAgent(options);
    }

    // Set the user ID if the user is logged in
    if (user) {
      // https://docs.newrelic.com/docs/browser/new-relic-browser/browser-apis/setuserid/
      agentRef.current?.setUserId(user.id);
    }
  }, [user]);

  return <>{children}</>;
};
