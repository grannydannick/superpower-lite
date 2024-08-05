import { HttpResponse, http } from 'msw';

import { env } from '@/config/env';

import { networkDelay } from '../utils';

import { appointmentsHandlers } from './appointments';
import { authHandlers } from './auth';
import { commentsHandlers } from './comments';
import { consultsHandlers } from './consults';
import { discussionsHandlers } from './discussions';
import { messagesHandlers } from './messages';
import { servicesHandlers } from './services';
import { teamsHandlers } from './teams';
import { usersHandlers } from './users';

export const handlers = [
  ...appointmentsHandlers,
  ...authHandlers,
  ...commentsHandlers,
  ...consultsHandlers,
  ...discussionsHandlers,
  ...messagesHandlers,
  ...servicesHandlers,
  ...teamsHandlers,
  ...usersHandlers,
  http.get(`${env.API_URL}/healthcheck`, async () => {
    await networkDelay();
    return HttpResponse.json({ ok: true });
  }),
];
