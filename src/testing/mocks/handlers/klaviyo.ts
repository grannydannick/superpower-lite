import { http, HttpResponse } from 'msw';

import { networkDelay } from '@/testing/mocks/utils';

export const klaviyoHandlers = [
  http.post('https://a.klaviyo.com/client/subscriptions', async () => {
    await networkDelay();

    return HttpResponse.json(
      {
        status: 'OK',
      },
      { status: 200 },
    );
  }),
];
