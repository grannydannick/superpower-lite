import { HttpResponse, http } from 'msw';

import { env } from '@/config/env';
import { biomarkersHandlers } from '@/testing/mocks/handlers/biomarkers';

import { networkDelay } from '../utils';

import { appointmentsHandlers } from './appointments';
import { authHandlers } from './auth';
import { consultsHandlers } from './consults';
import { messagesHandlers } from './messages';
import { phlebotomyHandlers } from './phlebotomy';
import { servicesHandlers } from './services';
import { twoFactorHandlers } from './two-factor';
import { usersHandlers } from './users';

export const handlers = [
  ...appointmentsHandlers,
  ...authHandlers,
  ...consultsHandlers,
  ...messagesHandlers,
  ...servicesHandlers,
  ...usersHandlers,
  ...twoFactorHandlers,
  ...phlebotomyHandlers,
  ...biomarkersHandlers,
  http.get(`${env.API_URL}/healthcheck`, async () => {
    await networkDelay();
    return HttpResponse.json({ ok: true });
  }),
];
