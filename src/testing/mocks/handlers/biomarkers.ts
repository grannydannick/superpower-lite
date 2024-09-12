import { HttpResponse, http } from 'msw';

import { env } from '@/config/env';

import { biomarkers } from '../data/biomarkers';
import { requireAuth, networkDelay } from '../utils';

export const biomarkersHandlers = [
  http.get(`${env.API_URL}/biomarkers`, async ({ request }) => {
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

      return HttpResponse.json({ biomarkers });
    } catch (error: any) {
      return HttpResponse.json(
        { message: error?.message || 'Server Error' },
        { status: 500 },
      );
    }
  }),
];
