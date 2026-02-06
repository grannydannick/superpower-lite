import { useMutation, useQuery } from '@tanstack/react-query';
import { isValidPhoneNumber, parsePhoneNumber } from 'libphonenumber-js';
import * as React from 'react';
import { configureAuth } from 'react-query-auth';
import { Navigate, useLocation } from 'react-router-dom';
import { z } from 'zod';

import { SuperpowerLoadingLogo } from '@/components/icons/superpower-logo';
import { env } from '@/config/env';
import { revealLatestQueryKey } from '@/features/protocol/api';
import { useTask } from '@/features/tasks/api/get-task';
import { MutationConfig } from '@/lib/react-query';
import { clearActiveLogin, setActiveLogin } from '@/lib/utils';
import { api as rawOrpcClient } from '@/orpc/client';
import {
  LoginAuthenticationResponse,
  OAuthGrantType,
  TokenResponse,
  User,
} from '@/types/api';
import { parseJWTPayload } from '@/utils/jwt';
import { getUtmData } from '@/utils/utm-middleware';

import { api } from './api-client';

const getUser = (): Promise<User> => {
  return api.get('/auth/me');
};

const logout = async (): Promise<void> => {
  await api.post('oauth2/logout');

  return clearActiveLogin();
};

const orpcClient = rawOrpcClient as any;

export const baseLoginInputSchema = z.object({
  redirectUri: z.string().optional(),
});

export const loginInputSchema = baseLoginInputSchema.merge(
  z.object({
    email: z
      .string()
      .min(1, 'Please enter your email address.')
      .email('Please enter a valid email address.'),
    password: z.string().min(5, 'Please enter your password.'),
    authMethod: z.enum(['admin']).optional(),
  }),
);

export type BaseLoginInput = z.infer<typeof baseLoginInputSchema>;

export type LoginInput = z.infer<typeof loginInputSchema>;
const loginWithEmailAndPassword = (
  data: LoginInput,
): Promise<LoginAuthenticationResponse> => {
  if (data.authMethod) {
    return api.post('auth/admin/login', {
      email: data.email,
      authMethod: data.authMethod,
    });
  }

  return api.post('/auth/login', data);
};

const REQUIRED_MSG = 'This is required.';

const requiredString = () =>
  z.string({ required_error: REQUIRED_MSG }).min(1, REQUIRED_MSG);

export const registerInputSchema = z.object({
  email: requiredString().email('Please enter a valid email address.'),
  phone: requiredString().refine(
    (value) => {
      if (!isValidPhoneNumber(value)) return false;

      const phoneNumber = parsePhoneNumber(value);
      return (
        phoneNumber &&
        (phoneNumber.country === 'US' || phoneNumber.country === 'CA')
      );
    },
    {
      message: 'Please enter a valid US or Canadian phone number.',
    },
  ),
  dateOfBirth: z.date({ required_error: REQUIRED_MSG }).refine((data) => {
    const today = new Date();
    const birthDate = new Date(data);
    let age = today.getFullYear() - birthDate.getFullYear();

    // Check if the user has not had their birthday this year yet
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age >= 18;
  }, 'You must be over 18 years old to register.'),
  consent: z
    .boolean({ required_error: 'Please agree to the Terms to continue.' })
    .refine((v) => v === true, {
      message: 'Please agree to the Terms to continue.',
    }),
  postalCode: requiredString().min(5, {
    message: 'Please enter a valid zip code.',
  }),
  phiMarketingConsent: z.boolean().optional(),
  gender: z.enum(['MALE', 'FEMALE']).optional(),
  state: z.string().optional(),
});

export type RegisterInput = z.infer<typeof registerInputSchema>;

const registerUser = (
  data: RegisterInput,
): Promise<LoginAuthenticationResponse> => {
  const registerData = {
    user: {
      ...data,
      dateOfBirth: new Date(
        Date.UTC(
          data.dateOfBirth.getFullYear(),
          data.dateOfBirth.getMonth(),
          data.dateOfBirth.getDate(),
        ),
      ),
    },
    campaignData: getUtmData(),
  };
  return api.post('/auth/newuser', registerData);
};

const authConfig = {
  userFn: getUser,
  loginFn: async (data: LoginInput): Promise<User> => {
    const response = await loginWithEmailAndPassword(data);

    if (!response.code) {
      throw Error('No code found.');
    }

    await processCode(response.code);

    return getUser();
  },
  registerFn: async (data: RegisterInput): Promise<User> => {
    const response = await registerUser(data);

    if (!response.code) {
      throw Error('No code found.');
    }

    await processCode(response.code);

    return getUser();
  },
  logoutFn: logout,
};

export const resetPasswordInputSchema = z.object({
  email: z.string().email().min(1),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordInputSchema>;

export const resetPassword = ({
  data,
}: {
  data: ResetPasswordInput;
}): Promise<void> => {
  return api.post('/auth/resetpassword', data);
};

type UseResetPasswordOptions = {
  mutationConfig?: MutationConfig<typeof resetPassword>;
};

export const useResetPassword = ({
  mutationConfig,
}: UseResetPasswordOptions = {}) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: resetPassword,
  });
};

export const setPasswordInputSchema = z
  .object({
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });
export type SetPasswordInput = z.infer<typeof setPasswordInputSchema>;

export const setPassword = ({
  data,
  id,
  secret,
}: {
  data: SetPasswordInput;
  id: string;
  secret: string;
}): Promise<void> => {
  return api.post('auth/setpassword', {
    id,
    secret,
    password: data.password,
  });
};

type UseSetPasswordOptions = {
  mutationConfig?: MutationConfig<typeof setPassword>;
};

export const useSetPassword = ({
  mutationConfig,
}: UseSetPasswordOptions = {}) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: setPassword,
  });
};

export const { useUser, useLogin, useLogout, useRegister } =
  configureAuth(authConfig);

type RevealLatestResponse = {
  carePlanId: string | null;
  showReveal: boolean | null;
  revealCompleted: boolean;
};

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const userQuery = useUser();
  const taskQuery = useTask({
    taskName: 'onboarding',
    queryConfig: {
      enabled: userQuery.isSuccess,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000), // 1s, 2s, 4s, max 5s
    },
  });
  const { data: revealLatest } = useQuery<RevealLatestResponse>({
    queryKey: revealLatestQueryKey,
    queryFn: async () => {
      const response = await orpcClient.POST('/protocol/reveal/latest');
      if (response.error) throw response.error;
      return response.data;
    },
    enabled: userQuery.isSuccess,
  });

  if (taskQuery.isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <SuperpowerLoadingLogo />
        <span className="sr-only">Loading</span>
      </div>
    );
  }

  if (!userQuery.data) {
    return (
      <Navigate
        to={`/signin?redirectTo=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  // note: we should probably never get to this state anyways
  if (taskQuery.isError) {
    return (
      <div className="p-4">
        <p className="text-red-600">Ooops...Error loading onboarding status.</p>
        <button onClick={() => taskQuery.refetch()}>Retry</button>
      </div>
    );
  }

  const onOnboarding = location.pathname.includes('/onboarding');

  const revealPermissiblePaths = [
    '/protocol/reveal',
    '/protocol/autopilot',
    '/onboarding', // Prevent infinite redirect loop
    '/action-plan/intro', // Videos
  ];
  const onPermissiblePath = revealPermissiblePaths.some((path) =>
    location.pathname.startsWith(path),
  );

  // Check if user should be redirected to protocol reveal flow
  const shouldRedirectToReveal =
    !!revealLatest?.carePlanId &&
    revealLatest.showReveal === true &&
    !revealLatest.revealCompleted;

  if (
    shouldRedirectToReveal &&
    !onPermissiblePath &&
    taskQuery.data?.task.status === 'completed' &&
    !userQuery.data?.adminActor
  ) {
    const target = '/protocol/reveal';
    console.warn(
      `Redirecting to protocol reveal: ${target}, current location: ${location.pathname}`,
    );
    return <Navigate to={target} replace />;
  }

  if (taskQuery.data) {
    const { task } = taskQuery.data;
    const isTaskIncomplete = task.status !== 'completed';
    const isSubscribed = !!userQuery.data?.subscribed;

    let target: string | null = null;

    if (isTaskIncomplete) {
      // If a user isn't subscribed, send them to checkout
      if (!isSubscribed) {
        window.location.href = `${env.MARKETING_SITE_URL}/checkout`;
        return null;
      }
      // otherwise, send to onboarding (but not if already there)
      else if (!onOnboarding) {
        target = '/onboarding';
      }
    }

    if (target && target !== location.pathname) {
      console.warn(
        `Redirecting to ${target}, current location: ${location.pathname}`,
      );
      return <Navigate to={target} replace />;
    }

    // Redirect to intake questionnaire if incomplete (only after onboarding is done)
    // Allow admins to bypass so they can triage other issues normally
  }

  return children;
};

/**
 * Verifies the tokens received from the auth server.
 * Validates the JWT against the JWKS.
 * See: https://openid.net/specs/openid-connect-core-1_0.html#TokenEndpoint
 * @param tokens
 */
const verifyTokens = async (tokens: TokenResponse) => {
  const token = tokens.access_token;

  // Verify token has not expired
  const tokenPayload = parseJWTPayload(token);

  if (Date.now() >= (tokenPayload.exp as number) * 1000) {
    clearActiveLogin();
    throw new Error('Token expired');
  }

  setActiveLogin({
    accessToken: token,
    refreshToken: tokens.refresh_token,
    profile: {
      userId: tokens.profile.userId,
    },
  });
};

/**
 * Makes a POST request to the tokens endpoint.
 * See: https://openid.net/specs/openid-connect-core-1_0.html#TokenEndpoint
 * @param formBody Token parameters in URL encoded format.
 */
const fetchTokens = async (formBody: URLSearchParams) => {
  try {
    const response: TokenResponse = await api.post('oauth2/token', formBody, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      withCredentials: true,
    });

    await verifyTokens(response);
  } catch {
    clearActiveLogin();
    throw new Error('Failed to fetch tokens');
  }
};

/**
 * Processes an OAuth authorization code.
 * See: https://openid.net/specs/openid-connect-core-1_0.html#TokenRequest
 * @param code The authorization code received by URL parameter.
 * @param loginParams Optional login parameters.
 * @category Authentication
 */
const processCode = (code: string, loginParams?: Partial<BaseLoginInput>) => {
  const formBody = new URLSearchParams();
  formBody.set('grant_type', OAuthGrantType.AuthorizationCode);
  formBody.set('code', code);
  formBody.set('redirect_uri', loginParams?.redirectUri ?? '');

  return fetchTokens(formBody);
};
