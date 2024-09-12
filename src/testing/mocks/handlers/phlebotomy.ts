import moment from 'moment';
import { http, HttpResponse } from 'msw';

import { env } from '@/config/env';
import { networkDelay, requireAuth } from '@/testing/mocks/utils';

export const phlebotomyHandlers = [
  http.post(`${env.API_URL}/phlebotomy/availability`, async ({ request }) => {
    await networkDelay();

    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];

    try {
      const { error } = await requireAuth(token);
      if (error) {
        return HttpResponse.json({ message: error }, { status: 401 });
      }
      // const data = (await request.json()) as AvailabilityBody;

      // Assuming today's date, and the time slot is fixed from 5 AM to 5:30 AM
      const todayStart = moment()
        .utc()
        .add(1, 'days')
        .startOf('day')
        .hour(40)
        .minute(0)
        .second(0); // Set to +40hours at 5 AM
      const todayEnd = moment(todayStart).add(30, 'minutes'); // 30 minutes later, at 5:30 AM

      const slot = {
        start: todayStart.toISOString(),
        end: todayEnd.toISOString(),
      };

      const slots: { start: string; end: string }[] = [];

      slots.push(slot);

      const convertedSlots = slots.map((slot) => {
        const startInPhoenix = moment
          .tz(slot.start, 'America/Phoenix')
          .toDate();
        const endInPhoenix = moment.tz(slot.end, 'America/Phoenix').toDate();

        return {
          start: startInPhoenix,
          end: endInPhoenix,
          status: 'free',
        };
      });

      return HttpResponse.json({
        slots: convertedSlots,
        timezone: 'US/Pacific',
      });
    } catch (error: any) {
      return HttpResponse.json(
        { message: error?.message || 'Server Error' },
        { status: 500 },
      );
    }
  }),
];
