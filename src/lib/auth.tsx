import { useMutation } from '@tanstack/react-query';
import { configureAuth } from 'react-query-auth';
import { Navigate, useLocation } from 'react-router-dom';
import { z } from 'zod';

import { MutationConfig } from '@/lib/react-query';
import { clearActiveLogin, setActiveLogin } from '@/lib/utils';
import {
  LoginAuthenticationResponse,
  OAuthGrantType,
  TokenResponse,
  User,
} from '@/types/api';
import { parseJWTPayload } from '@/utils/jwt';

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
    email: z.string().min(1, 'Required').email('Invalid email'),
    password: z.string().min(5, 'Required'),
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
  firstName: z.string().min(1, 'First name is required.'),
  lastName: z.string().min(1, 'Last name is required.'),
  email: z.string().email('Invalid email address.'),
  phone: z.string().min(1, 'Phone number is required.').max(12),
  dateOfBirth: z
    .object({
      from: z.date(),
      to: z.date(),
    })
    .refine((data: { from: Date; to: Date }) => {
      const today = new Date();
      const birthDate = new Date(data.from);
      // Calculate the user's age.
      let age = today.getFullYear() - birthDate.getFullYear();
      // Check if the user has already had their birthday this year.
      const m = today.getMonth() - birthDate.getMonth();
      // If the user hasn't had their birthday yet, subtract one year.
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age >= 18;
    }, 'You must be at least 18 years old to register.'),
  gender: z.enum(['MALE', 'FEMALE']),
  password: z.string().min(6, 'Password must be at least 6 characters long.'),
});

export type RegisterInput = z.infer<typeof registerInputSchema>;

const registerWithEmailAndPassword = (
  data: RegisterInput,
): Promise<LoginAuthenticationResponse> => {
  const registerData = {
    ...data,
    dateOfBirth: data.dateOfBirth.from.toISOString(),
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
  const userQuery = useUser();
  const location = useLocation();

  if (!userQuery.data) {
    return (
      <Navigate
        to={`/signin?redirectTo=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  if (userQuery.data) {
    const user = userQuery.data;

    const needsOnboarding =
      user.onboarding?.status === 'INCOMPLETE' &&
      !location.pathname.includes('onboarding');

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
    profile: tokens.profile,
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
