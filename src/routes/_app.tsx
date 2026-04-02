import type { QueryClient } from '@tanstack/react-query';
import {
  createFileRoute,
  Outlet,
  redirect,
  useRouterState,
} from '@tanstack/react-router';
import { type ReactNode } from 'react';

import { AppLayout } from '@/components/layouts/app-layout';
import { env } from '@/config/env';
import {
  buildQuestionnaireStatusMap,
  getQuestionnaireStatus,
} from '@/features/onboarding/utils/get-questionnaire-status';
import { revealLatestQueryOptions } from '@/features/protocol/api/reveal';
import { getQuestionnaireResponseListQueryOptions } from '@/features/questionnaires/api/questionnaire-response';
import { getTaskQueryOptions } from '@/features/tasks/api/get-task';
import { authenticatedUserQueryOptions } from '@/lib/auth';
import { isIntakeDismissed } from '@/lib/intake-dismiss';
import { LazyStripeProvider } from '@/lib/lazy-stripe-provider';
import { aiChatApi } from '@/orpc/ai-chat-api';

const revealMock = {
  shouldShow: false as const,
  lastCompletedPhase: 'completed' as const,
};
const DEV_REVEAL_ABORT_MS = 150;
let skipRevealLookupInDev = false;

async function getRevealData(queryClient: QueryClient) {
  if (!import.meta.env.DEV) {
    return queryClient
      .ensureQueryData(revealLatestQueryOptions())
      .catch(() => null);
  }

  if (skipRevealLookupInDev) {
    return revealMock;
  }

  const revealQueryOptions = revealLatestQueryOptions();
  const cachedRevealData = queryClient.getQueryData<
    Awaited<ReturnType<NonNullable<typeof revealQueryOptions.queryFn>>>
  >(revealQueryOptions.queryKey);

  if (cachedRevealData) {
    return cachedRevealData;
  }

  const abortController = new AbortController();
  const timeoutId = window.setTimeout(() => {
    abortController.abort();
  }, DEV_REVEAL_ABORT_MS);

  try {
    const { data, error, response } = await aiChatApi.GET(
      '/protocol-v2/reveal/latest',
      { signal: abortController.signal },
    );

    if (!response.ok || error || data === undefined) {
      skipRevealLookupInDev = true;
      return revealMock;
    }

    queryClient.setQueryData(revealQueryOptions.queryKey, data);
    return data;
  } catch {
    skipRevealLookupInDev = true;
    return revealMock;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export const Route = createFileRoute('/_app')({
  beforeLoad: async ({ context, location }) => {
    const { queryClient } = context;
    const redirectTo = location.href;

    const [user, onboarding] = await Promise.all([
      queryClient
        .ensureQueryData(authenticatedUserQueryOptions())
        .catch(() => null),
      queryClient
        .ensureQueryData(getTaskQueryOptions('onboarding'))
        .catch(() => null),
    ]);

    if (user === null) {
      throw redirect({
        to: '/signin',
        search: { redirectTo },
        replace: true,
      });
    }

    if (onboarding?.task.status !== 'completed') {
      if (user.subscribed !== true) {
        throw redirect({
          href: `${env.MARKETING_SITE_URL}/checkout`,
        });
      }

      if (!location.pathname.startsWith('/onboarding')) {
        throw redirect({
          to: '/onboarding',
          replace: true,
        });
      }

      return;
    }

    const revealPermissiblePaths = [
      '/protocol/reveal',
      '/onboarding', // Prevent infinite redirect loop
      '/intake', // Medical intake for legacy members
    ];
    let onPermissiblePath = false;
    for (const path of revealPermissiblePaths) {
      if (location.pathname.startsWith(path)) {
        onPermissiblePath = true;
        break;
      }
    }

    if (onPermissiblePath) {
      return;
    }

    if (user.adminActor !== null && user.adminActor !== undefined) {
      return;
    }

    const revealData = await getRevealData(queryClient);

    if (
      revealData?.shouldShow === true &&
      revealData?.lastCompletedPhase !== 'completed'
    ) {
      throw redirect({
        to: '/protocol/reveal',
        replace: true,
      });
    }

    const intakeDismissed = isIntakeDismissed();
    const shouldRunLegacyIntakeChecks =
      !import.meta.env.DEV && !intakeDismissed;
    const createdAtDate = new Date(user.createdAt);
    const createdAtIsValid = !Number.isNaN(createdAtDate.getTime());

    let isLegacyMember = false;
    if (shouldRunLegacyIntakeChecks && createdAtIsValid) {
      const now = new Date();
      const sixMonthsAgo = new Date(now);
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      // Clamp to last day of target month if day-of-month overflowed
      if (sixMonthsAgo.getDate() !== now.getDate()) {
        sixMonthsAgo.setDate(0);
      }

      isLegacyMember = createdAtDate < sixMonthsAgo;
    }

    const shouldFetchLegacyIntakes =
      shouldRunLegacyIntakeChecks && createdAtIsValid && isLegacyMember;

    const intakeResponses = shouldFetchLegacyIntakes
      ? await queryClient
          .ensureQueryData(
            getQuestionnaireResponseListQueryOptions({
              questionnaireName:
                'onboarding-primer,onboarding-medical-history,onboarding-female-health,onboarding-lifestyle',
              status: 'completed',
            }),
          )
          .catch(() => undefined)
      : undefined;

    if (import.meta.env.DEV) {
      return;
    }

    if (!shouldFetchLegacyIntakes) {
      return;
    }

    const statusMap = buildQuestionnaireStatusMap(intakeResponses);
    const primerDone =
      getQuestionnaireStatus(statusMap, 'onboarding-primer') === 'completed';
    const medicalHistoryDone =
      getQuestionnaireStatus(statusMap, 'onboarding-medical-history') ===
      'completed';
    const femaleHealthDone =
      getQuestionnaireStatus(statusMap, 'onboarding-female-health') ===
      'completed';
    const lifestyleDone =
      getQuestionnaireStatus(statusMap, 'onboarding-lifestyle') === 'completed';

    const isFemale = user.gender?.toLowerCase() === 'female';
    const hasAllIntakes =
      primerDone &&
      medicalHistoryDone &&
      (!isFemale || femaleHealthDone) &&
      lifestyleDone;

    if (!hasAllIntakes) {
      throw redirect({
        to: '/intake',
        replace: true,
      });
    }
  },
  component: AppRootComponent,
});

function AppRootComponent() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const stripeRoutePrefixes = [
    '/schedule',
    '/orders',
    '/services',
    '/questionnaire',
    '/settings',
    '/protocol/reveal',
  ];

  let needsStripe = false;
  for (const prefix of stripeRoutePrefixes) {
    if (pathname.startsWith(prefix)) {
      needsStripe = true;
      break;
    }
  }

  let content: ReactNode = <Outlet />;

  if (needsStripe) {
    content = (
      <LazyStripeProvider>
        <Outlet />
      </LazyStripeProvider>
    );
  }

  return <AppLayout>{content}</AppLayout>;
}
