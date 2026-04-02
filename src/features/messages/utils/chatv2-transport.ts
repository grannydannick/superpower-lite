import { DefaultChatTransport, type UIMessage } from 'ai';

import { env } from '@/config/env';
import { refreshAccessTokenSingleFlight } from '@/lib/api-client';
import { getActiveLogin } from '@/lib/utils';

export function createChatV2Transport<UI_MESSAGE extends UIMessage>() {
  const authFetch: typeof fetch = async (input, init) => {
    const response = await globalThis.fetch(input, init);

    if (response.status !== 401 || !getActiveLogin()?.refreshToken) {
      return response;
    }

    try {
      const token = await refreshAccessTokenSingleFlight();
      if (!token) return response;

      const headers = new Headers(init?.headers);
      headers.set('Authorization', `Bearer ${token}`);
      return await globalThis.fetch(input, { ...init, headers });
    } catch (err) {
      console.warn('chatv2 fetch auth refresh failed', err);
      return response;
    }
  };

  return new DefaultChatTransport<UI_MESSAGE>({
    api: `${env.API_URL}/chat/chatv2`,
    credentials: 'include',
    fetch: authFetch,
    headers: () => {
      const accessToken = getActiveLogin()?.accessToken;
      return {
        Accept: 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      };
    },
    prepareSendMessagesRequest: ({ id, messages }) => {
      const lastUserMessage = [...messages]
        .reverse()
        .find((m) => m.role === 'user');
      if (!lastUserMessage) {
        throw new Error('No user message to send.');
      }

      return {
        body: { id, message: lastUserMessage },
      };
    },
  });
}
