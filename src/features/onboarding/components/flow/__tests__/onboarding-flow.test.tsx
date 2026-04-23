import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router';
import { render, screen, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  type GetOnboardingResponse,
  useOnboarding,
} from '@/features/onboarding/api/onboarding';
import { useOnboardingProgress } from '@/features/onboarding/stores/onboarding-progress-store';
import { useUpdateTask } from '@/features/tasks/api/update-task';
import { usePosthogFeatureFlagEnabled } from '@/hooks/use-posthog-feature-flag-enabled';
import { useUser } from '@/lib/auth';
import type { User } from '@/types/api';

import * as onboardingFlowModule from '../onboarding-flow';

vi.mock('@/features/onboarding/api/onboarding', () => ({
  useOnboarding: vi.fn(),
}));

vi.mock('@/features/onboarding/stores/onboarding-progress-store', () => ({
  useOnboardingProgress: vi.fn(),
}));

vi.mock('@/hooks/use-posthog-feature-flag-enabled', () => ({
  usePosthogFeatureFlagEnabled: vi.fn(),
}));

vi.mock('@/features/tasks/api/update-task', () => ({
  useUpdateTask: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  useUser: vi.fn(),
}));

vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: PropsWithChildren) => <>{children}</>,
}));

vi.mock('../onboarding-step-renderers', () => ({
  getOnboardingStepDefinition: (stepId: string | null) => {
    if (stepId === 'advanced-testing') {
      return {
        render: () => <div>Advanced testing step</div>,
      };
    }

    if (stepId === 'bundled-discount') {
      return {
        render: () => <div>Bundled discount step</div>,
      };
    }

    if (stepId === 'how-you-heard-about-us') {
      return {
        render: () => <div>Heard about us step</div>,
      };
    }

    if (stepId === 'account-setup') {
      return {
        render: () => <div>Account setup step</div>,
      };
    }

    if (stepId === 'schedule-blood-draw') {
      return {
        render: () => <div>Schedule blood draw step</div>,
      };
    }

    return undefined;
  },
}));

const baseUser = {
  id: 'user-1',
  username: 'user-1',
  firstName: 'Test',
  lastName: 'User',
  createdAt: '2026-01-01T00:00:00.000Z',
  email: 'test@example.com',
  phone: '5555555555',
  dateOfBirth: '1990-01-01',
  gender: 'male',
  subscribed: true,
  admin: false,
  authMethod: 'password',
  address: [],
  role: ['MEMBER'],
} satisfies User;

const onboardingData = {
  status: { state: 'in_progress' },
  userInfo: {
    userInfoCompleted: true,
    userGender: 'female',
    userAge: 32,
  },
  questionnaires: [],
  credits: [],
  onboardingPolicy: {
    showUpsells: true,
  },
} satisfies GetOnboardingResponse;

const completedOnboardingData = {
  ...onboardingData,
  questionnaires: [
    { identifier: 'onboarding-primer', status: 'completed' },
    { identifier: 'onboarding-medical-history', status: 'completed' },
    { identifier: 'onboarding-female-health', status: 'completed' },
    { identifier: 'onboarding-lifestyle', status: 'completed' },
  ],
} satisfies GetOnboardingResponse;

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => <div>Home</div>,
});

const onboardingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/onboarding/$step',
  component: OnboardingRouteComponent,
});

function OnboardingRouteComponent() {
  const { step } = onboardingRoute.useParams();

  return <onboardingFlowModule.OnboardingFlow stepPath={step} />;
}

const updateTaskProgressMock = vi.fn();

describe('OnboardingFlow', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useOnboarding).mockReturnValue({
      data: onboardingData,
      isLoading: false,
    } as unknown as ReturnType<typeof useOnboarding>);

    vi.mocked(useUser).mockReturnValue({
      data: baseUser,
      isFetched: true,
    } as unknown as ReturnType<typeof useUser>);

    vi.mocked(useOnboardingProgress).mockReturnValue(true);
    vi.mocked(usePosthogFeatureFlagEnabled).mockReturnValue(false);
    vi.mocked(useUpdateTask).mockReturnValue({
      mutateAsync: updateTaskProgressMock,
    } as unknown as ReturnType<typeof useUpdateTask>);
    updateTaskProgressMock.mockResolvedValue(undefined);
  });

  it('redirects away from schedule-blood-draw when the skip flag is enabled', async () => {
    vi.mocked(usePosthogFeatureFlagEnabled).mockReturnValue(true);

    const router = createRouter({
      routeTree: rootRoute.addChildren([homeRoute, onboardingRoute]),
      history: createMemoryHistory({
        initialEntries: ['/onboarding/schedule-blood-draw'],
      }),
      defaultPendingMs: 0,
      defaultPendingMinMs: 0,
    });

    await router.load({ sync: true });

    render(<RouterProvider router={router} />);

    await waitFor(() =>
      expect(router.state.location.pathname).toBe(
        '/onboarding/advanced-testing',
      ),
    );
    expect(screen.getByText('Advanced testing step')).toBeInTheDocument();
  });

  it('selects the next remaining step when the current step becomes invalid', () => {
    expect(
      onboardingFlowModule.getFallbackOnboardingStep?.(
        'how-you-heard-about-us',
        ['advanced-testing', 'bundled-discount', 'account-setup'],
      ),
    ).toBe('account-setup');
  });

  it('completes onboarding and redirects home when no valid steps remain', async () => {
    vi.mocked(useOnboarding).mockReturnValue({
      data: completedOnboardingData,
      isLoading: false,
    } as unknown as ReturnType<typeof useOnboarding>);
    vi.mocked(usePosthogFeatureFlagEnabled).mockReturnValue(true);

    const router = createRouter({
      routeTree: rootRoute.addChildren([homeRoute, onboardingRoute]),
      history: createMemoryHistory({
        initialEntries: ['/onboarding/schedule-blood-draw'],
      }),
      defaultPendingMs: 0,
      defaultPendingMinMs: 0,
    });

    await router.load({ sync: true });

    render(<RouterProvider router={router} />);

    await waitFor(() =>
      expect(updateTaskProgressMock).toHaveBeenCalledWith({
        taskName: 'onboarding',
        data: { status: 'completed' },
      }),
    );
    await waitFor(() => expect(router.state.location.pathname).toBe('/'));
    expect(screen.getByText('Home')).toBeInTheDocument();
  });
});
