import axios, { InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';

import { env } from '@/config/env';
import { clearActiveLogin, getActiveLogin, setActiveLogin } from '@/lib/utils';
import { OAuthGrantType, OperationOutcome, TokenResponse } from '@/types/api';
import { parseJWTPayload } from '@/utils/jwt';

function authRequestInterceptor(config: InternalAxiosRequestConfig) {
  if (config.headers) {
    config.headers.Accept = 'application/json';
    config.headers.Authorization = `Bearer ${getActiveLogin()?.accessToken}`;
  }

  config.withCredentials = true;
  return config;
}

export const api = axios.create({
  baseURL: env.API_URL,
});

api.interceptors.request.use(authRequestInterceptor);

api.interceptors.response.use(
  (config) => {
    return config.data;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response.status !== 401) {
      if (error.response.data) {
        const apiError: OperationOutcome = error.response.data;

        for (const e of apiError.issue) {
          toast.error(e.details.text);
        }
      }
    }

    if (
      error.response.status === 401 &&
      error.config &&
      !error.config._isRetry
    ) {
      originalRequest._isRetry = true;
      try {
        const refreshToken = getActiveLogin()?.refreshToken;

        if (refreshToken) {
          /*
           * we are not reusing auth.tsx functions here
           * because we need to make this request from different
           * axios instance (that is not api)
           * */
          const formBody = new URLSearchParams();
          formBody.set('grant_type', OAuthGrantType.RefreshToken);
          formBody.set('refresh_token', refreshToken);

          const tokens = await axios.post<TokenResponse>(
            `${env.API_URL}/oauth2/token`,
            formBody,
            {
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              withCredentials: true,
            },
          );

          const token = tokens.data.access_token;

          // Verify token has not expired
          const tokenPayload = parseJWTPayload(token);
          if (Date.now() >= (tokenPayload.exp as number) * 1000) {
            clearActiveLogin();
            window.location.reload();
            throw new Error('Token expired');
          }

          setActiveLogin({
            accessToken: token,
            refreshToken: tokens.data.refresh_token,
            profile: tokens.data.profile,
          });

          originalRequest.headers.Authorization = `Bearer ${token}`;
        }

        return api.request(originalRequest);
      } catch (err) {
        console.log('Not authorized');

        clearActiveLogin();
        window.location.reload();
      }
    }
    throw error;
  },
);
