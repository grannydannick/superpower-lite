/**
 * Centralised API client that handles authentication headers, refresh tokens,
 * and transient error messaging. The goal is to ensure that a single refresh
 * request is reused when many calls fail with 401s at the same time.
 */
import axios, {
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';

import { toast } from '@/components/ui/sonner';
import { env } from '@/config/env';
import { clearActiveLogin, getActiveLogin, setActiveLogin } from '@/lib/utils';
import { OAuthGrantType, TokenResponse } from '@/types/api';

type ApiErrorPayload = {
  message?: string;
  issue?: Array<{
    details: {
      text: string;
    };
  }>;
};

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _isRetry?: boolean;
};

// Shares a single refresh call across concurrent 401s so that only one refresh hits the server.
let refreshPromise: ReturnType<typeof refreshAccessToken> | null = null;

const AUTH_PUBLIC_PATH_PREFIXES = [
  '/signin',
  '/register',
  '/claim-benefit',
  '/resetpassword',
  '/setpassword',
  '/check-email',
  '/verify-email',
];

const redirectToSignin = () => {
  if (typeof window === 'undefined') {
    return;
  }

  const { pathname, search } = window.location;

  const isOnPublicAuthRoute = AUTH_PUBLIC_PATH_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );

  if (isOnPublicAuthRoute) {
    return;
  }

  const currentPath = `${pathname}${search}`;
  const redirectUrl = `/signin?redirectTo=${encodeURIComponent(currentPath)}`;

  window.location.replace(redirectUrl);
};

// Performs the OAuth refresh token grant and persists the new login state.
const refreshAccessToken = async (): Promise<string | undefined> => {
  const refreshToken = getActiveLogin()?.refreshToken;
  if (!refreshToken) {
    throw new Error('Missing refresh token');
  }

  const formBody = new URLSearchParams();
  // Standard OAuth refresh token payload.
  formBody.set('grant_type', OAuthGrantType.RefreshToken);
  formBody.set('refresh_token', refreshToken);

  const response = await axios.post<TokenResponse>(
    `${env.API_URL}/oauth2/token`,
    formBody,
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      withCredentials: true,
    },
  );

  const accessToken = response.data?.access_token;
  if (!accessToken) {
    return;
  }

  // Persist the updated tokens so queued requests can pick them up.
  setActiveLogin({
    accessToken,
    refreshToken: response.data.refresh_token,
    profile: {
      userId: response.data.profile.userId,
    },
  });

  return accessToken;
};

export const refreshAccessTokenSingleFlight = async (): Promise<
  string | undefined
> => {
  if (!getActiveLogin()?.refreshToken) {
    throw new Error('Missing refresh token');
  }

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        return await refreshAccessToken();
      } catch (err) {
        console.warn('Failed to refresh access token', err);
        clearActiveLogin();
        throw err;
      } finally {
        refreshPromise = null;
      }
    })();
  }

  return await refreshPromise;
};

// Automatically ensure every request includes auth + the expected content type.
function authRequestInterceptor(config: InternalAxiosRequestConfig) {
  if (config.headers) {
    config.headers.Accept = 'application/json';
    const token = getActiveLogin()?.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if ('Authorization' in config.headers) {
      delete (config.headers as Record<string, any>).Authorization;
    }
  }

  config.withCredentials = true;
  return config;
}

export const api = axios.create({
  baseURL: env.API_URL,
});

api.interceptors.request.use(authRequestInterceptor);

api.interceptors.response.use(
  (config: AxiosResponse) => {
    return config.data;
  },
  async (error: AxiosError<ApiErrorPayload>) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;
    const response = error.response;

    if (!response || !originalRequest) {
      throw error;
    }

    // Individual requests can opt-out of global toasts by setting the header.
    const hideToast = originalRequest.headers?.['x-hide-toast'] === 'true';

    // Handle non-authentication errors
    if (response.status !== 401) {
      if (!hideToast && response.data) {
        const apiError = response.data as ApiErrorPayload;

        // OperationOutcome style errors ship issues; fall back to message otherwise.
        if (apiError.issue?.length) {
          for (const issue of apiError.issue) {
            if (issue.details?.text) {
              toast.error(issue.details.text);
            }
          }
        } else if (apiError.message) {
          toast.error(apiError.message);
        } else {
          toast.error('An unknown error occurred. Please try again later.');
        }
      }
    }

    if (originalRequest.url?.includes('/oauth2/token')) {
      clearActiveLogin();
      redirectToSignin();
      throw error;
    }

    if (response.status === 401 && !originalRequest._isRetry) {
      if (!getActiveLogin()?.refreshToken) {
        clearActiveLogin();
        redirectToSignin();
        throw error;
      }

      originalRequest._isRetry = true;

      try {
        // Each 401 waits for the shared refresh to settle before retrying the original request.
        const token = await refreshAccessTokenSingleFlight();
        if (token !== undefined) {
          const headers = originalRequest.headers ?? {};
          originalRequest.headers = headers;
          // Support both AxiosHeaders (with set) and plain objects (tests, mocks).
          if ('set' in headers && typeof headers.set === 'function') {
            headers.set('Authorization', `Bearer ${token}`);
          } else {
            headers.Authorization = `Bearer ${token}`;
          }
        }
        return api.request(originalRequest);
      } catch (err) {
        redirectToSignin();
        throw err;
      }
    }
    throw error;
  },
);
