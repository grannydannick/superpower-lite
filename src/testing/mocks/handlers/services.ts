import { HttpResponse, http } from 'msw';

import { env } from '@/config/env';

import { services } from '../data/services';
import { requireAuth, networkDelay } from '../utils';

export const servicesHandlers = [
  http.get(`${env.API_URL}/services`, async ({ request }) => {
    await networkDelay();

    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];

    try {
      const { error } = await requireAuth(token);
      if (error) {
        return HttpResponse.json({ message: error }, { status: 401 });
      }

      // const result = db.healthcareService.findMany({});
      // return HttpResponse.json(result);

      return HttpResponse.json({ services });
    } catch (error: any) {
      return HttpResponse.json(
        { message: error?.message || 'Server Error' },
        { status: 500 },
      );
    }
  }),

  http.get(
    `${env.API_URL}/services/:serviceId`,
    async ({ params, request }) => {
      await networkDelay();

      const authHeader = request.headers.get('Authorization');
      const token = authHeader?.split(' ')[1];

      try {
        const { error } = await requireAuth(token);
        if (error) {
          return HttpResponse.json({ message: error }, { status: 401 });
        }
        const serviceId = params.serviceId as string;
        const service = services.find(({ id }) => id === serviceId);
        // const service = db.healthcareService.findFirst({
        //   where: {
        //     id: {
        //       equals: serviceId,
        //     },
        //   },
        // });

        if (!service) {
          return HttpResponse.json(
            { message: 'Service not found' },
            { status: 404 },
          );
        }

        return HttpResponse.json(service);
      } catch (error: any) {
        return HttpResponse.json(
          { message: error?.message || 'Server Error' },
          { status: 500 },
        );
      }
    },
  ),
];
