import { HttpResponse, http } from 'msw';

import { networkDelay } from '@/testing/mocks/utils';

import { mockAddressComponents } from '../../../../__mocks__/use-places-service';

export const googleHandlers = [
  http.get('https://maps.googleapis.com/maps/api/geocode/json', async () => {
    await networkDelay();

    return HttpResponse.json(
      {
        status: 'OK',
        results: [
          {
            address_components: mockAddressComponents,
          },
        ],
      },
      { status: 200 },
    );
  }),
];
