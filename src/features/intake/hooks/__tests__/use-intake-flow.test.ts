import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useQuestionnaireResponseList } from '@/features/questionnaires/api/questionnaire-response';
import { useUser } from '@/lib/auth';

import { INTAKE_STEP_IDS } from '../../intake-step-ids';
import { useIntakeFlowStore } from '../../stores/intake-flow-store';
import { useIntakeFlow } from '../use-intake-flow';

vi.mock('@/lib/auth', () => ({
  useUser: vi.fn(),
}));

vi.mock('@/features/questionnaires/api/questionnaire-response', () => ({
  useQuestionnaireResponseList: vi.fn(),
}));

const useUserMock = vi.mocked(useUser, { partial: true });
const useQuestionnaireResponseListMock = vi.mocked(
  useQuestionnaireResponseList,
  { partial: true },
);
const originalSyncFlow = useIntakeFlowStore.getState().syncFlow;

describe('useIntakeFlow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useIntakeFlowStore.setState({ syncFlow: originalSyncFlow });
    useIntakeFlowStore.getState().reset();

    useUserMock.mockReturnValue({
      data: undefined,
      isLoading: false,
    });

    useQuestionnaireResponseListMock.mockReturnValue({
      data: undefined,
      isLoading: false,
    });
  });

  it('initializes the store on first render when valid steps are available', () => {
    const { result } = renderHook(() => useIntakeFlow());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isInitialized).toBe(true);
    expect(useIntakeFlowStore.getState().isInitialized).toBe(true);
    expect(useIntakeFlowStore.getState().currentStep).toBe(
      INTAKE_STEP_IDS.INTAKE_SPLASH,
    );
  });

  it('syncs once for unchanged flow state', async () => {
    const syncFlowSpy = vi.fn((...args: Parameters<typeof originalSyncFlow>) =>
      originalSyncFlow(...args),
    );
    useIntakeFlowStore.setState({ syncFlow: syncFlowSpy });

    const { result, rerender } = renderHook(() => useIntakeFlow());

    await waitFor(() => expect(result.current.isInitialized).toBe(true));
    expect(syncFlowSpy).toHaveBeenCalledTimes(1);

    syncFlowSpy.mockClear();

    rerender();

    expect(syncFlowSpy).toHaveBeenCalledTimes(0);
  });
});
