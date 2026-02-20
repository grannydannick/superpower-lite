import { useMutation, useQuery } from '@tanstack/react-query';
import * as React from 'react';
import { configureAuth } from 'react-query-auth';
import { Navigate, useLocation } from 'react-router';

import { SuperpowerLoadingLogo } from '@/components/icons/superpower-logo';
import { env } from '@/config/env';
import {
  buildQuestionnaireStatusMap,
  getQuestionnaireStatus,
} from '@/features/onboarding/utils/get-questionnaire-status';
import { revealLatestQueryKey } from '@/features/protocol/api/reveal-latest';
import { useQuestionnaireResponseList } from '@/features/questionnaires/api/questionnaire-response';
import { useTask } from '@/features/tasks/api/get-task';
import { isIntakeDismissed } from '@/lib/intake-dismiss';
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

import { api } from './api-client';
import type {
  BaseLoginInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  SetPasswordInput,
} from './auth-schemas';

export type {
  BaseLoginInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  SetPasswordInput,
} from './auth-schemas';

const getUser = (): Promise<User> => {
  return api.get('/auth/me');
};

const logout = async (): Promise<void> => {
  await api.post('oauth2/logout');

  return clearActiveLogin();
};

const orpcClient = rawOrpcClient as any;
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
    campaignData: {},
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

  const onboardingDone = taskQuery.data?.task.status === 'completed';
  const { data: intakeResponses, isLoading: intakeLoading } =
    useQuestionnaireResponseList(
      {
        questionnaireName:
          'onboarding-primer,onboarding-medical-history,onboarding-female-health,onboarding-lifestyle',
        status: 'completed',
      },
      { enabled: userQuery.isSuccess && onboardingDone },
    );

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
    '/intake', // Medical intake for legacy members
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
    const isDev = import.meta.env.DEV;

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

    // Redirect legacy members (account > 6 months old) with incomplete intakes
    if (
      onboardingDone &&
      !isDev &&
      !intakeLoading &&
      !userQuery.data?.adminActor &&
      !onPermissiblePath
    ) {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      // Clamp to last day of target month if day-of-month overflowed
      const now = new Date();
      if (sixMonthsAgo.getDate() !== now.getDate()) {
        sixMonthsAgo.setDate(0);
      }

      const isLegacy =
        userQuery.data?.createdAt &&
        new Date(userQuery.data.createdAt) < sixMonthsAgo;

      const statusMap = buildQuestionnaireStatusMap(intakeResponses);
      const done = (name: string) =>
        getQuestionnaireStatus(statusMap, name) === 'completed';

      const isFemale = userQuery.data?.gender?.toLowerCase() === 'female';
      const hasAllIntakes =
        done('onboarding-primer') &&
        done('onboarding-medical-history') &&
        (!isFemale || done('onboarding-female-health')) &&
        done('onboarding-lifestyle');

      if (isLegacy && !hasAllIntakes && !isIntakeDismissed()) {
        return <Navigate to="/intake" replace />;
      }
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
