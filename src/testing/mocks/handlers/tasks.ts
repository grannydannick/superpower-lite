import { http, HttpResponse } from 'msw';

import { env } from '@/config/env';
import { networkDelay, requireAuth } from '@/testing/mocks/utils';

export const tasksHandlers = [
  http.get(`${env.API_URL}/tasks/:id`, async ({ params, request }) => {
    await networkDelay();

    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];

    const taskId = params.id as string;

    try {
      const { error } = await requireAuth(token);
      if (error) {
        return HttpResponse.json({ message: error }, { status: 401 });
      }

      return HttpResponse.json({
        task: {
          // todo: random ID
          id: '4f9b3d29-b335-42d1-bfa6-caceab479065',
          status: 'completed',
          priority: 'asap',
          // TODO: better taskId handle
          name: taskId === 'onboarding' ? 'Onboarding' : '???',
          reason: taskId === 'onboarding' ? 'Onboarding Task' : '???',
          progress: taskId === 'onboarding' ? 10 : undefined,
        },
      });
    } catch (error: any) {
      return HttpResponse.json(
        { message: error?.message || 'Server Error' },
        { status: 500 },
      );
    }
  }),
];
