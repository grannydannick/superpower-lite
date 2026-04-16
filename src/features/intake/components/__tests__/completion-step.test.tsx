import { beforeEach, expect, test, vi } from 'vitest';

import { rtlRender, screen, userEvent } from '@/testing/test-utils';

import { INTAKE_STEP_IDS } from '../../intake-step-ids';
import { useIntakeFlowStore } from '../../stores/intake-flow-store';
import { CompletionStep } from '../completion-step';

const navigateMock = vi.fn();

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual<typeof import('@tanstack/react-router')>(
    '@tanstack/react-router',
  );

  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

beforeEach(() => {
  navigateMock.mockReset();
  useIntakeFlowStore.getState().reset();
});

test('navigates home and resets flow state', async () => {
  useIntakeFlowStore
    .getState()
    .syncFlow(
      [INTAKE_STEP_IDS.INTAKE_SPLASH, INTAKE_STEP_IDS.INTAKE_COMPLETION],
      'user-123',
    );
  useIntakeFlowStore.getState().next();

  expect(useIntakeFlowStore.getState().currentStep).toBe(
    INTAKE_STEP_IDS.INTAKE_COMPLETION,
  );

  rtlRender(<CompletionStep />);

  await userEvent.click(screen.getByRole('button', { name: /continue/i }));

  expect(useIntakeFlowStore.getState().currentStep).toBeNull();
  expect(useIntakeFlowStore.getState().isInitialized).toBe(false);
  expect(navigateMock).toHaveBeenCalledWith({ to: '/', replace: true });
});
