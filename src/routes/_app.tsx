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
import { revealLatestQueryOptions } from '@/features/protocol/api/reveal-latest';
import { getQuestionnaireResponseListQueryOptions } from '@/features/questionnaires/api/questionnaire-response';
import { getTaskQueryOptions } from '@/features/tasks/api/get-task';
import { authenticatedUserQueryOptions } from '@/lib/auth';
import { isIntakeDismissed } from '@/lib/intake-dismiss';
import { LazyStripeProvider } from '@/lib/lazy-stripe-provider';

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
      '/protocol/autopilot',
      '/onboarding', // Prevent infinite redirect loop
      '/intake', // Medical intake for legacy members
      '/action-plan/intro', // Videos
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

    const [revealLatest, intakeResponses] = await Promise.all([
      queryClient
        .ensureQueryData(revealLatestQueryOptions)
        .catch(() => undefined),
      shouldFetchLegacyIntakes
        ? queryClient
            .ensureQueryData(
              getQuestionnaireResponseListQueryOptions({
                questionnaireName:
                  'onboarding-primer,onboarding-medical-history,onboarding-female-health,onboarding-lifestyle',
                status: 'completed',
              }),
            )
            .catch(() => undefined)
        : Promise.resolve(undefined),
    ]);

    if (
      revealLatest?.carePlanId != null &&
      revealLatest?.showReveal === true &&
      revealLatest?.revealCompleted !== true
    ) {
      throw redirect({
        to: '/protocol/reveal',
        replace: true,
      });
    }

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
    '/onboarding',
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
