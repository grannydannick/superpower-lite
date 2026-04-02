import { createAuthClient } from 'better-auth/client';
import {
  adminClient,
  emailOTPClient,
  phoneNumberClient,
} from 'better-auth/client/plugins';

import { env } from '@/config/env';

export const authClient = createAuthClient({
  baseURL: env.AUTH_URL,
  plugins: [adminClient(), emailOTPClient(), phoneNumberClient()],
  fetchOptions: {
    // Late-binding wrapper: reads globalThis.fetch at call time so that
    // test interceptors (MSW) installed after module evaluation are picked up.
    customFetchImpl: (...args: Parameters<typeof fetch>) => fetch(...args),
  },
});
