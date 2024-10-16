import { HttpResponse, http } from 'msw';

import { env } from '@/config/env';

import { db, persistDb } from '../db';
import {
  authenticate,
  hash,
  requireAuth,
  networkDelay,
  getAuthTokens,
} from '../utils';

type NewUserBody = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
};

type LoginBody = {
  email: string;
  password: string;
};

export const authHandlers = [
  http.post(`${env.API_URL}/auth/newuser`, async ({ request }) => {
    await networkDelay();
    try {
      const userObject = (await request.json()) as NewUserBody;

      const existingUser = db.user.findFirst({
        where: {
          email: {
            equals: userObject.email,
          },
        },
      });

      if (existingUser) {
        return HttpResponse.json(
          { message: 'The user already exists' },
          { status: 400 },
        );
      }

      db.user.create({
        ...userObject,
        role: ['SUPER_ADMIN', 'MEMBER'],
        password: hash(userObject.password),
      });

      await persistDb('user');

      const { login } = await authenticate({
        email: userObject.email,
        password: userObject.password,
      });

      return HttpResponse.json({ code: login.id, userId: login.userId });
    } catch (error: any) {
      return HttpResponse.json(
        { message: error?.message || 'Server Error' },
        { status: 500 },
      );
    }
  }),

  http.post(`${env.API_URL}/oauth2/token`, async ({ request }) => {
    await networkDelay();

    try {
      let loginId: string;

      /* weird hack because without this non-test requests failing */
      if (import.meta.env.NODE_ENV === 'test' || env.ENABLE_API_MOCKING) {
        const formData = await request.formData();
        loginId = formData.get('code') as string;
      } else {
        const formData = (await request.json()) as { code: string };

        loginId = formData.code;
      }

      const existingLogin = db.login.findFirst({
        where: {
          id: {
            equals: loginId,
          },
        },
      });

      if (!existingLogin) {
        return HttpResponse.json(
          { message: 'Not authorized.' },
          { status: 401 },
        );
      }

      const existingUser = db.user.findFirst({
        where: {
          id: {
            equals: existingLogin.userId,
          },
        },
      });

      if (!existingUser) {
        return HttpResponse.json(
          { message: 'Not authorized.' },
          { status: 401 },
        );
      }

      const { accessToken, refreshToken } = await getAuthTokens({
        ...existingLogin,
      });

      return HttpResponse.json({
        token_type: 'Bearer',
        expires_in: 3600,
        id_token: 'id_token',
        access_token: accessToken,
        refresh_token: refreshToken,
        profile: { userId: existingUser.id },
      });
    } catch (error: any) {
      return HttpResponse.json(
        { message: error?.message || 'Server Error' },
        { status: 500 },
      );
    }
  }),

  http.post(`${env.API_URL}/auth/login`, async ({ request }) => {
    await networkDelay();

    try {
      const credentials = (await request.json()) as LoginBody;
      const { login } = await authenticate(credentials);

      return HttpResponse.json({ code: login.id, userId: login.userId });
    } catch (error: any) {
      return HttpResponse.json(
        { message: error?.message || 'Server Error' },
        { status: 500 },
      );
    }
  }),

  http.post(`${env.API_URL}/oauth2/logout`, async ({ request }) => {
    await networkDelay();

    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];

    try {
      const { login } = await requireAuth(token);

      db.login.update({
        where: {
          id: { equals: login?.id as string },
        },
        data: {
          revoked: true,
        },
      });

      await persistDb('login');

      return HttpResponse.json({ message: 'Logged out' });
    } catch (error: any) {
      return HttpResponse.json(
        { message: error?.message || 'Server Error' },
        { status: 500 },
      );
    }
  }),

  http.get(`${env.API_URL}/auth/me`, async ({ request }) => {
    await networkDelay();

    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];

    try {
      const { user } = await requireAuth(token);
      return HttpResponse.json(user);
    } catch (error: any) {
      return HttpResponse.json(
        { message: error?.message || 'Server Error' },
        { status: 500 },
      );
    }
  }),

  http.get(`${env.API_URL}/auth/coupon`, async ({ request }) => {
    await networkDelay();

    try {
      // Construct a URL instance out of the intercepted request.
      const url = new URL(request.url);

      // Read the "id" URL query parameter using the "URLSearchParams" API.
      // Given "/product?id=1", "productId" will equal "1".
      const code = url.searchParams.get('code');

      // Note that query parameters are potentially undefined.
      // Make sure to account for that in your handlers.
      if (!code) {
        return new HttpResponse(null, { status: 404 });
      }

      return HttpResponse.json(
        { success: code === 'SUPERPOWER' },
        { status: code === 'SUPERPOWER' ? 200 : 404 },
      );
    } catch (error: any) {
      return HttpResponse.json(
        { message: error?.message || 'Server Error' },
        { status: 500 },
      );
    }
  }),
];
