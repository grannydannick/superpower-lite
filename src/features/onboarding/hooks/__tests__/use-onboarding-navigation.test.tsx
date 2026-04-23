import { act, renderHook, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  OnboardingNavigationProvider,
  useOnboardingNavigation,
} from '../use-onboarding-navigation';

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  track: vi.fn(),
  updateTaskProgress: vi.fn(),
}));

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mocks.navigate,
}));

vi.mock('@/features/tasks/api/update-task', () => ({
  useUpdateTask: () => ({
    mutateAsync: mocks.updateTaskProgress,
  }),
}));

vi.mock('@/hooks/use-analytics', () => ({
  useAnalytics: () => ({
    track: mocks.track,
  }),
}));

describe('useOnboardingNavigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.updateTaskProgress.mockResolvedValue(undefined);
  });

  it('navigates to the next onboarding step when one remains', () => {
    function Wrapper({ children }: PropsWithChildren) {
      return (
        <OnboardingNavigationProvider
          currentStep="about-you"
          validSteps={['about-you', 'medical-history']}
        >
          {children}
        </OnboardingNavigationProvider>
      );
    }

    const { result } = renderHook(() => useOnboardingNavigation(), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.next();
    });

    expect(mocks.track).toHaveBeenCalledWith('onboarding_step_next', {
      current_step: 'primer',
      next_step: 'medical-history',
      steps: [{ id: 'primer' }, { id: 'medical-history' }],
    });
    expect(mocks.navigate).toHaveBeenCalledWith({
      to: '/onboarding/$step',
      params: { step: 'medical-history' },
    });
    expect(mocks.updateTaskProgress).not.toHaveBeenCalled();
  });

  it('completes onboarding and navigates home on the last step', async () => {
    function Wrapper({ children }: PropsWithChildren) {
      return (
        <OnboardingNavigationProvider
          currentStep="medical-history"
          validSteps={['about-you', 'medical-history']}
        >
          {children}
        </OnboardingNavigationProvider>
      );
    }

    const { result } = renderHook(() => useOnboardingNavigation(), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.next();
    });

    await waitFor(() =>
      expect(mocks.updateTaskProgress).toHaveBeenCalledWith({
        taskName: 'onboarding',
        data: { status: 'completed' },
      }),
    );
    await waitFor(() =>
      expect(mocks.navigate).toHaveBeenCalledWith({ to: '/' }),
    );
    expect(mocks.track).not.toHaveBeenCalled();
  });
});
