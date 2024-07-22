import { HttpResponse, http } from 'msw';

import { env } from '@/config/env';

// import { db } from '../db';
import { requireAuth, networkDelay } from '../utils';

export const consultsHandlers = [
  http.get(`${env.API_URL}/consults`, async ({ cookies }) => {
    await networkDelay();

    try {
      const { error } = requireAuth(cookies);
      if (error) {
        return HttpResponse.json({ message: error }, { status: 401 });
      }
      // const result = db.consult.findMany({});
      // return HttpResponse.json(result);
      return HttpResponse.json(CONSULTS);
    } catch (error: any) {
      return HttpResponse.json(
        { message: error?.message || 'Server Error' },
        { status: 500 },
      );
    }
  }),

  http.get(
    `${env.API_URL}/consults/:consultId`,
    async ({ params, cookies }) => {
      await networkDelay();

      try {
        const { error } = requireAuth(cookies);
        if (error) {
          return HttpResponse.json({ message: error }, { status: 401 });
        }
        const consultId = params.consultId as string;
        // const consult = db.consult.findFirst({
        //   where: {
        //     id: {
        //       equals: consultId,
        //     },
        //   },
        // });
        const consult = CONSULTS.find(({ id }) => id === consultId);

        if (!consult) {
          return HttpResponse.json(
            { message: 'Consult not found' },
            { status: 404 },
          );
        }

        return HttpResponse.json(consult);
      } catch (error: any) {
        return HttpResponse.json(
          { message: error?.message || 'Server Error' },
          { status: 500 },
        );
      }
    },
  ),
];

const CONSULTS = [
  {
    id: '1',
    name: 'General',
    practitioner: 'Dr. Jonathan Richina',
  },
  {
    id: '2',
    name: 'Dietician Consult',
    practitioner: 'Dr. Jonathan Richina',
  },
  {
    id: '3',
    name: 'Fitness Consult',
    practitioner: 'Dr. Jonathan Richina',
  },
];
