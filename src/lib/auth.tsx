import { useMutation } from '@tanstack/react-query';
import { isValidPhoneNumber, parsePhoneNumber } from 'libphonenumber-js';
import * as React from 'react';
import { configureAuth } from 'react-query-auth';
import { Navigate, useLocation } from 'react-router-dom';
import { z } from 'zod';

import { SuperpowerLoadingLogo } from '@/components/icons/superpower-logo';
import { useTask } from '@/features/tasks/api/get-task';
import { MutationConfig } from '@/lib/react-query';
import { clearActiveLogin, setActiveLogin } from '@/lib/utils';
import { AddressInput, formAddressInputSchema } from '@/types/address';
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

export const registerInputSchema = z.object({
  firstName: z.string().min(1, 'Please enter your first name.'),
  lastName: z.string().min(1, 'Please enter your last name.'),
  email: z.string().email('Please enter a valid email address.'),
  phone: z
    .string()
    .min(1, 'Please enter your phone number.')
    .refine(
      (value) => {
        if (!isValidPhoneNumber(value)) return false;

        const phoneNumber = parsePhoneNumber(value);
        return phoneNumber && phoneNumber.country === 'US';
      },
      {
        message: 'Please enter a valid US phone number.',
      },
    ),
  dateOfBirth: z.date().refine((data) => {
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
  gender: z.enum(['MALE', 'FEMALE']),
  password: z
    .string()
    .min(8, 'Please enter a password with at least 8 characters.'),
  textMessageConsent: z.boolean().optional(),
  address: formAddressInputSchema,
});

export type RegisterInput = z.infer<typeof registerInputSchema>;

const registerWithEmailAndPassword = (
  data: RegisterInput,
): Promise<LoginAuthenticationResponse> => {
  const line = [data.address.line1];

  if (data.address.line2) {
    line.push(data.address.line2);
  }

  const address: AddressInput = {
    line: line,
    city: data.address.city,
    state: data.address.state,
    postalCode: data.address.postalCode,
    use: 'home',
  };

  const registerData = {
    user: {
      ...data,
      address,
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
    const response = await registerWithEmailAndPassword(data);

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

  if (taskQuery.data) {
    const task = taskQuery.data.task;

    const needsOnboarding =
      task.status !== 'completed' && !location.pathname.includes('onboarding');

    if (needsOnboarding) {
      return <Navigate to={`/onboarding`} replace />;
    }
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
  } catch (error) {
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
