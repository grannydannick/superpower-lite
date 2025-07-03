import axios, { InternalAxiosRequestConfig } from 'axios';

import { toast } from '@/components/ui/sonner';
import { env } from '@/config/env';
import { clearActiveLogin, getActiveLogin, setActiveLogin } from '@/lib/utils';
import { OAuthGrantType, TokenResponse } from '@/types/api';

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

    // Check if toast notifications should be hidden for this request
    const hideToast = originalRequest?.headers?.['x-hide-toast'] === 'true';

    // Handle non-authentication errors
    if (error.response.status !== 401) {
      if (!hideToast && error.response.data) {
        const apiError = error.response.data;

        /**
         * If we have issue inside then API error is of type OperationOutcome
         */
        if (apiError.issue) {
          for (const issue of apiError.issue) {
            toast(issue.details.text);
          }
        } else if (apiError.message) {
          toast(apiError.message);
        } else {
          toast('An unknown error occurred. Please try again later.');
        }
      }
    }

    if (originalRequest.url.includes('/oauth2/token')) {
      clearActiveLogin();
      window.location.reload();
      throw error;
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

          setActiveLogin({
            accessToken: token,
            refreshToken: tokens.data.refresh_token,
            profile: {
              userId: tokens.data.profile.userId,
            },
          });

          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api.request(originalRequest);
        }
      } catch (err) {
        console.log('Not authorized');

        clearActiveLogin();
        window.location.reload();
      }
    }
    throw error;
  },
);
