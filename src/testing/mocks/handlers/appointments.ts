import { HttpResponse, http } from 'msw';

import { env } from '@/config/env';

import { requireAuth, networkDelay } from '../utils';

type AppointmentsServiceabilityBody = {
  postalCode: string;
};

export const appointmentsHandlers = [
  http.post(
    `${env.API_URL}/appointments/serviceability`,
    async ({ request, cookies }) => {
      await networkDelay();

      try {
        const { error } = requireAuth(cookies);
        if (error) {
          return HttpResponse.json({ message: error }, { status: 401 });
        }
        const data = (await request.json()) as AppointmentsServiceabilityBody;

        const serviceable = data.postalCode === '85003';

        return HttpResponse.json({ serviceable });
      } catch (error: any) {
        return HttpResponse.json(
          { message: error?.message || 'Server Error' },
          { status: 500 },
        );
      }
    },
  ),
];
