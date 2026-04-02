import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { Navigate, useRouter, useRouterState } from '@tanstack/react-router';
import * as React from 'react';
import { configureAuth } from 'react-query-auth';

import { SuperpowerLoadingLogo } from '@/components/icons/superpower-logo';
import { toast } from '@/components/ui/sonner';
import { env } from '@/config/env';
import {
  buildQuestionnaireStatusMap,
  getQuestionnaireStatus,
} from '@/features/onboarding/utils/get-questionnaire-status';
import { useQuestionnaireResponseList } from '@/features/questionnaires/api/questionnaire-response';
import { useTask } from '@/features/tasks/api/get-task';
import { useAnalytics } from '@/hooks/use-analytics';
import { isIntakeDismissed } from '@/lib/intake-dismiss';
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
import { authClient } from './auth-client';
import type {
  BaseLoginInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  SetPasswordInput,
} from './auth-schemas';

function ExternalRedirect({ href }: { href: string }) {
  React.useEffect(() => {
    window.location.href = href;
  }, [href]);

  return null;
}

export type {
  BaseLoginInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  SetPasswordInput,
} from './auth-schemas';

export const getUser = (): Promise<User> => {
  return api.get('/auth/me');
};

export const authenticatedUserQueryOptions = () => {
  return queryOptions({
    queryKey: ['authenticated-user'],
    queryFn: getUser,
  });
};

const logout = async (): Promise<void> => {
  await Promise.all([
    authClient.signOut(),
    // Also clear legacy OAuth2 sessions for users who haven't migrated yet.
    api
      .post('oauth2/logout', undefined, { headers: { 'x-hide-toast': 'true' } })
      .catch(() => {}),
  ]);

  return clearActiveLogin();
};

const loginWithEmailAndPassword = async (data: LoginInput): Promise<void> => {
  if (data.authMethod) {
    const response: LoginAuthenticationResponse = await api.post(
      'auth/admin/login',
      { email: data.email, authMethod: data.authMethod },
    );
    if (!response.code) {
      throw new Error('No code found.');
    }
    await processCode(response.code);
    return;
  }

  const { error } = await authClient.signIn.email({
    email: data.email,
    password: data.password,
  });

  if (error) {
    toast.error(error.message);
    throw new Error(error.message);
  }
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
    await loginWithEmailAndPassword(data);
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

export const resetPassword = async ({
  data,
}: {
  data: ResetPasswordInput;
}): Promise<void> => {
  const { error } = await authClient.requestPasswordReset({
    email: data.email,
    redirectTo: `${env.APP_URL}/setpassword`,
  });

  if (error) {
    toast.error(error.message);
    throw new Error(error.message);
  }
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

export const setPassword = async ({
  data,
  token,
}: {
  data: SetPasswordInput;
  token: string;
}): Promise<void> => {
  const { error } = await authClient.resetPassword({
    newPassword: data.password,
    token,
  });

  if (error) {
    toast.error(error.message);
    throw new Error(error.message);
  }
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

const impersonateUser = async ({
  userId,
}: {
  userId: string;
}): Promise<void> => {
  const { error } = await authClient.admin.impersonateUser({ userId });

  if (error) {
    toast.error(error.message);
    throw new Error(error.message);
  }
};

export const useImpersonateUser = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { reset } = useAnalytics();

  return useMutation({
    mutationFn: impersonateUser,
    onSuccess: () => {
      reset();
      queryClient.removeQueries();
      void router.invalidate();
    },
  });
};

const stopImpersonating = async (): Promise<void> => {
  const { error } = await authClient.admin.stopImpersonating();

  if (error) {
    toast.error(error.message);
    throw new Error(error.message);
  }
};

export const useStopImpersonating = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { reset } = useAnalytics();

  return useMutation({
    mutationFn: stopImpersonating,
    onSuccess: () => {
      reset();
      queryClient.removeQueries();
      void router.invalidate();
    },
  });
};

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const userQuery = useUser();
  const taskQuery = useTask({
    taskName: 'onboarding',
    queryConfig: {
      enabled: userQuery.isSuccess,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000), // 1s, 2s, 4s, max 5s
    },
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

  if (!userQuery.isFetched) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <SuperpowerLoadingLogo />
        <span className="sr-only">Loading</span>
      </div>
    );
  }

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
        to="/signin"
        search={{
          redirectTo: pathname,
        }}
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

  const onOnboarding = pathname.includes('/onboarding');

  if (taskQuery.data) {
    const { task } = taskQuery.data;
    const isTaskIncomplete = task.status !== 'completed';
    const isSubscribed = !!userQuery.data?.subscribed;
    const isDev = import.meta.env.DEV;

    let target: string | null = null;

    if (isTaskIncomplete) {
      // If a user isn't subscribed, send them to checkout
      if (!isSubscribed) {
        return <ExternalRedirect href={`${env.MARKETING_SITE_URL}/checkout`} />;
      }
      // otherwise, send to onboarding (but not if already there)
      else if (!onOnboarding) {
        target = '/onboarding';
      }
    }

    if (target && target !== pathname) {
      console.warn(`Redirecting to ${target}, current location: ${pathname}`);
      return <Navigate to={target} replace />;
    }

    // Redirect legacy members (account > 6 months old) with incomplete intakes
    if (
      onboardingDone &&
      !isDev &&
      !intakeLoading &&
      !userQuery.data?.adminActor
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
