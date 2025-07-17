import { HttpResponse, http } from 'msw';

import { env } from '@/config/env';

import { networkDelay } from '../utils';

import { appointmentsHandlers } from './appointments';
import { authHandlers } from './auth';
import { biomarkersHandlers } from './biomarkers';
import { consultsHandlers } from './consults';
import { googleHandlers } from './google';
import { klaviyoHandlers } from './klaviyo';
import { messagesHandlers } from './messages';
import { phlebotomyHandlers } from './phlebotomy';
import { servicesHandlers } from './services';
import { tasksHandlers } from './tasks';
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
  ...googleHandlers,
  ...klaviyoHandlers,
  ...tasksHandlers,
  http.get(`${env.API_URL}/healthcheck`, async () => {
    await networkDelay();
    return HttpResponse.json({ ok: true });
  }),
];
