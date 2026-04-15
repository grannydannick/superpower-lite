import { act, renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { STEP_IDS, type StepId } from '../../config/step-config';
import { useOnboardingFlowStore } from '../onboarding-flow-store';

// Sample steps for testing
const TEST_STEPS: StepId[] = [
  STEP_IDS.UPDATE_INFO,
  STEP_IDS.INTAKE,
  STEP_IDS.PHLEBOTOMY_BOOKING,
];

const TEST_USER_ID = 'user-123';

// Note: Zustand mock auto-resets stores after each test (see __mocks__/zustand.ts)
describe('useOnboardingFlowStore', () => {
  describe('syncFlow()', () => {
    it('sets currentStep to first step', () => {
      const { result } = renderHook(() => useOnboardingFlowStore());

      act(() => {
        result.current.syncFlow(TEST_STEPS, TEST_USER_ID);
      });

      expect(result.current.currentStep).toBe(STEP_IDS.UPDATE_INFO);
    });

    it('sets validSteps to provided steps', () => {
      const { result } = renderHook(() => useOnboardingFlowStore());

      act(() => {
        result.current.syncFlow(TEST_STEPS, TEST_USER_ID);
      });

      expect(result.current.validSteps).toEqual(TEST_STEPS);
    });

    it('sets isInitialized to true', () => {
      const { result } = renderHook(() => useOnboardingFlowStore());

      act(() => {
        result.current.syncFlow(TEST_STEPS, TEST_USER_ID);
      });

      expect(result.current.isInitialized).toBe(true);
    });

    it('resumes from persisted step if still valid', () => {
      const { result } = renderHook(() => useOnboardingFlowStore());

      // Simulate a previous session: initialize and navigate to middle step
      act(() => {
        result.current.syncFlow(TEST_STEPS, TEST_USER_ID);
      });
      act(() => {
        result.current.next(); // Move to INTAKE
      });
      expect(result.current.currentStep).toBe(STEP_IDS.INTAKE);

      // Simulate re-mount: re-initialize with same steps (persisted currentStep is INTAKE)
      act(() => {
        result.current.syncFlow(TEST_STEPS, TEST_USER_ID);
      });

      // Should resume at INTAKE, not reset to first step
      expect(result.current.currentStep).toBe(STEP_IDS.INTAKE);
    });

    it('falls back to first step if persisted step is no longer valid', () => {
      const { result } = renderHook(() => useOnboardingFlowStore());

      // Simulate a previous session at INTAKE
      act(() => {
        result.current.syncFlow(TEST_STEPS, TEST_USER_ID);
      });
      act(() => {
        result.current.next(); // Move to INTAKE
      });
      expect(result.current.currentStep).toBe(STEP_IDS.INTAKE);

      // Re-initialize with steps that don't include INTAKE
      const newSteps: StepId[] = [
        STEP_IDS.UPDATE_INFO,
        STEP_IDS.PHLEBOTOMY_BOOKING,
      ];
      act(() => {
        result.current.syncFlow(newSteps, TEST_USER_ID);
      });

      // Should fall back to first step
      expect(result.current.currentStep).toBe(STEP_IDS.UPDATE_INFO);
    });

    it('resets to first step when user changes', () => {
      const { result } = renderHook(() => useOnboardingFlowStore());

      // User A initializes and navigates to middle step
      act(() => {
        result.current.syncFlow(TEST_STEPS, 'user-a');
      });
      act(() => {
        result.current.next(); // Move to INTAKE
      });
      expect(result.current.currentStep).toBe(STEP_IDS.INTAKE);

      // User B logs in and initializes with same steps
      act(() => {
        result.current.syncFlow(TEST_STEPS, 'user-b');
      });

      // Should start at first step, not resume user A's position
      expect(result.current.currentStep).toBe(STEP_IDS.UPDATE_INFO);
    });

    it('handles empty steps array', () => {
      const { result } = renderHook(() => useOnboardingFlowStore());

      act(() => {
        result.current.syncFlow([], TEST_USER_ID);
      });

      expect(result.current.currentStep).toBeNull();
      expect(result.current.validSteps).toEqual([]);
      expect(result.current.isInitialized).toBe(true);
    });

    it('handles single step', () => {
      const { result } = renderHook(() => useOnboardingFlowStore());

      act(() => {
        result.current.syncFlow([STEP_IDS.PHLEBOTOMY_BOOKING], TEST_USER_ID);
      });

      expect(result.current.currentStep).toBe(STEP_IDS.PHLEBOTOMY_BOOKING);
      expect(result.current.validSteps).toEqual([STEP_IDS.PHLEBOTOMY_BOOKING]);
    });

    it('keeps a persisted later step when gift-upsell is prepended', () => {
      const { result } = renderHook(() => useOnboardingFlowStore());

      act(() => {
        result.current.syncFlow(
          [STEP_IDS.UPDATE_INFO, STEP_IDS.PHLEBOTOMY_BOOKING],
          TEST_USER_ID,
        );
      });
      act(() => {
        result.current.goTo(STEP_IDS.PHLEBOTOMY_BOOKING);
      });

      act(() => {
        result.current.syncFlow(
          [
            STEP_IDS.GIFT_UPSELL,
            STEP_IDS.UPDATE_INFO,
            STEP_IDS.PHLEBOTOMY_BOOKING,
          ],
          TEST_USER_ID,
        );
      });

      expect(result.current.currentStep).toBe(STEP_IDS.PHLEBOTOMY_BOOKING);
    });
  });

  describe('dismissGiftUpsell()', () => {
    it('marks gift-upsell as seen for the current user', () => {
      const { result } = renderHook(() => useOnboardingFlowStore());

      act(() => {
        result.current.syncFlow([STEP_IDS.GIFT_UPSELL], TEST_USER_ID);
      });
      act(() => {
        result.current.dismissGiftUpsell();
      });

      expect(result.current.hasSeenGiftUpsell).toBe(true);
    });

    it('clears the seen flag on reset so the next user starts fresh', () => {
      const { result } = renderHook(() => useOnboardingFlowStore());

      act(() => {
        result.current.syncFlow([STEP_IDS.GIFT_UPSELL], TEST_USER_ID);
      });
      act(() => {
        result.current.dismissGiftUpsell();
      });
      act(() => {
        result.current.reset();
      });

      expect(result.current.hasSeenGiftUpsell).toBe(false);
    });

    it('clears the seen flag when a new user logs in after reset', () => {
      const { result } = renderHook(() => useOnboardingFlowStore());

      // User A dismisses the upsell then logs out
      act(() => {
        result.current.syncFlow([STEP_IDS.GIFT_UPSELL], 'user-a');
      });
      act(() => {
        result.current.dismissGiftUpsell();
      });
      act(() => {
        result.current.reset();
      });

      // User B logs in — userId transitions from null, so switchingUsers would
      // be false without the reset() fix; the flag must still be cleared.
      act(() => {
        result.current.syncFlow([STEP_IDS.GIFT_UPSELL], 'user-b');
      });

      expect(result.current.hasSeenGiftUpsell).toBe(false);
    });

    it('resets the seen flag when a different user logs in on the same device', () => {
      const { result } = renderHook(() => useOnboardingFlowStore());

      act(() => {
        result.current.syncFlow([STEP_IDS.GIFT_UPSELL], TEST_USER_ID);
      });
      act(() => {
        result.current.dismissGiftUpsell();
      });

      expect(result.current.hasSeenGiftUpsell).toBe(true);

      act(() => {
        result.current.syncFlow([STEP_IDS.GIFT_UPSELL], 'different-user-id');
      });

      expect(result.current.hasSeenGiftUpsell).toBe(false);
    });

    it('preserves the seen flag when the same user re-syncs', () => {
      const { result } = renderHook(() => useOnboardingFlowStore());

      act(() => {
        result.current.syncFlow([STEP_IDS.GIFT_UPSELL], TEST_USER_ID);
      });
      act(() => {
        result.current.dismissGiftUpsell();
      });
      act(() => {
        result.current.syncFlow([STEP_IDS.PHLEBOTOMY_BOOKING], TEST_USER_ID);
      });

      expect(result.current.hasSeenGiftUpsell).toBe(true);
    });
  });

  describe('next()', () => {
    it('advances to next step', () => {
      const { result } = renderHook(() => useOnboardingFlowStore());

      act(() => {
        result.current.syncFlow(TEST_STEPS, TEST_USER_ID);
      });

      act(() => {
        result.current.next();
      });

      expect(result.current.currentStep).toBe(STEP_IDS.INTAKE);
    });

    it('does nothing on last step', () => {
      const { result } = renderHook(() => useOnboardingFlowStore());

      act(() => {
        result.current.syncFlow(TEST_STEPS, TEST_USER_ID);
      });

      // Navigate to last step
      act(() => {
        result.current.goTo(STEP_IDS.PHLEBOTOMY_BOOKING);
      });

      expect(result.current.currentStep).toBe(STEP_IDS.PHLEBOTOMY_BOOKING);

      // Try to go next
      act(() => {
        result.current.next();
      });

      // Should still be on last step
      expect(result.current.currentStep).toBe(STEP_IDS.PHLEBOTOMY_BOOKING);
    });

    it('does nothing before initialize (null guard)', () => {
      const { result } = renderHook(() => useOnboardingFlowStore());

      // currentStep is null before initialize
      expect(result.current.currentStep).toBeNull();

      act(() => {
        result.current.next();
      });

      // Should still be null
      expect(result.current.currentStep).toBeNull();
    });
  });

  describe('prev()', () => {
    it('goes back to previous step', () => {
      const { result } = renderHook(() => useOnboardingFlowStore());

      act(() => {
        result.current.syncFlow(TEST_STEPS, TEST_USER_ID);
      });

      // Go to second step
      act(() => {
        result.current.next();
      });

      expect(result.current.currentStep).toBe(STEP_IDS.INTAKE);

      // Go back
      act(() => {
        result.current.prev();
      });

      expect(result.current.currentStep).toBe(STEP_IDS.UPDATE_INFO);
    });

    it('does nothing on first step', () => {
      const { result } = renderHook(() => useOnboardingFlowStore());

      act(() => {
        result.current.syncFlow(TEST_STEPS, TEST_USER_ID);
      });

      expect(result.current.currentStep).toBe(STEP_IDS.UPDATE_INFO);

      // Try to go back
      act(() => {
        result.current.prev();
      });

      // Should still be on first step
      expect(result.current.currentStep).toBe(STEP_IDS.UPDATE_INFO);
    });

    it('does nothing before initialize (null guard)', () => {
      const { result } = renderHook(() => useOnboardingFlowStore());

      // currentStep is null before initialize
      expect(result.current.currentStep).toBeNull();

      act(() => {
        result.current.prev();
      });

      // Should still be null
      expect(result.current.currentStep).toBeNull();
    });
  });

  describe('goTo()', () => {
    it('navigates to valid step', () => {
      const { result } = renderHook(() => useOnboardingFlowStore());

      act(() => {
        result.current.syncFlow(TEST_STEPS, TEST_USER_ID);
      });

      act(() => {
        result.current.goTo(STEP_IDS.PHLEBOTOMY_BOOKING);
      });

      expect(result.current.currentStep).toBe(STEP_IDS.PHLEBOTOMY_BOOKING);
    });

    it('does nothing with invalid stepId', () => {
      const { result } = renderHook(() => useOnboardingFlowStore());

      act(() => {
        result.current.syncFlow(TEST_STEPS, TEST_USER_ID);
      });

      const initialStep = result.current.currentStep;

      // Try to go to a step not in validSteps
      act(() => {
        result.current.goTo(STEP_IDS.DIGITAL_TWIN);
      });

      // Should stay on current step
      expect(result.current.currentStep).toBe(initialStep);
    });

    it('does nothing before initialize', () => {
      const { result } = renderHook(() => useOnboardingFlowStore());

      act(() => {
        result.current.goTo(STEP_IDS.UPDATE_INFO);
      });

      // Should still be null (step not in empty validSteps)
      expect(result.current.currentStep).toBeNull();
    });
  });

  describe('reset()', () => {
    it('clears all state', () => {
      const { result } = renderHook(() => useOnboardingFlowStore());

      act(() => {
        result.current.syncFlow(TEST_STEPS, TEST_USER_ID);
      });

      // Navigate to a different step
      act(() => {
        result.current.next();
      });

      expect(result.current.currentStep).toBe(STEP_IDS.INTAKE);
      expect(result.current.isInitialized).toBe(true);

      // Reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.currentStep).toBeNull();
      expect(result.current.validSteps).toEqual([]);
      expect(result.current.isInitialized).toBe(false);
    });
  });

  describe('isLastStep', () => {
    it('returns true on last step', () => {
      const { result } = renderHook(() => useOnboardingFlowStore());

      act(() => {
        result.current.syncFlow(TEST_STEPS, TEST_USER_ID);
      });

      act(() => {
        result.current.goTo(STEP_IDS.PHLEBOTOMY_BOOKING);
      });

      expect(result.current.isLastStep).toBe(true);
    });

    it('returns false on non-last step', () => {
      const { result } = renderHook(() => useOnboardingFlowStore());

      act(() => {
        result.current.syncFlow(TEST_STEPS, TEST_USER_ID);
      });

      expect(result.current.isLastStep).toBe(false);
    });

    it('returns false when currentStep is null', () => {
      const { result } = renderHook(() => useOnboardingFlowStore());

      expect(result.current.isLastStep).toBe(false);
    });

    it('returns true for single-step flow', () => {
      const { result } = renderHook(() => useOnboardingFlowStore());

      act(() => {
        result.current.syncFlow([STEP_IDS.PHLEBOTOMY_BOOKING], TEST_USER_ID);
      });

      expect(result.current.isLastStep).toBe(true);
    });
  });

  describe('isFirstStep', () => {
    it('returns true on first step', () => {
      const { result } = renderHook(() => useOnboardingFlowStore());

      act(() => {
        result.current.syncFlow(TEST_STEPS, TEST_USER_ID);
      });

      expect(result.current.isFirstStep).toBe(true);
    });

    it('returns false on non-first step', () => {
      const { result } = renderHook(() => useOnboardingFlowStore());

      act(() => {
        result.current.syncFlow(TEST_STEPS, TEST_USER_ID);
      });

      act(() => {
        result.current.next();
      });

      expect(result.current.isFirstStep).toBe(false);
    });

    it('returns false when currentStep is null', () => {
      const { result } = renderHook(() => useOnboardingFlowStore());

      expect(result.current.isFirstStep).toBe(false);
    });

    it('returns true for single-step flow', () => {
      const { result } = renderHook(() => useOnboardingFlowStore());

      act(() => {
        result.current.syncFlow([STEP_IDS.PHLEBOTOMY_BOOKING], TEST_USER_ID);
      });

      expect(result.current.isFirstStep).toBe(true);
    });
  });

  describe('syncFlow() with changed steps', () => {
    it('updates validSteps while keeping current step for same user', () => {
      const { result } = renderHook(() => useOnboardingFlowStore());

      act(() => {
        result.current.syncFlow(TEST_STEPS, TEST_USER_ID);
      });

      // Navigate to middle step
      act(() => {
        result.current.next();
      });
      expect(result.current.currentStep).toBe(STEP_IDS.INTAKE);

      // Update steps with new list that still includes current step
      const newSteps: StepId[] = [
        STEP_IDS.UPDATE_INFO,
        STEP_IDS.INTAKE,
        STEP_IDS.FEMALE_HEALTH,
        STEP_IDS.PHLEBOTOMY_BOOKING,
      ];

      act(() => {
        result.current.syncFlow(newSteps, TEST_USER_ID);
      });

      // Should still be on INTAKE
      expect(result.current.currentStep).toBe(STEP_IDS.INTAKE);
      expect(result.current.validSteps).toEqual(newSteps);
    });

    it('goes to first step if current step is no longer valid', () => {
      const { result } = renderHook(() => useOnboardingFlowStore());

      act(() => {
        result.current.syncFlow(TEST_STEPS, TEST_USER_ID);
      });

      // Navigate to middle step
      act(() => {
        result.current.next();
      });
      expect(result.current.currentStep).toBe(STEP_IDS.INTAKE);

      // Update steps with new list that doesn't include current step
      const newSteps: StepId[] = [
        STEP_IDS.UPDATE_INFO,
        STEP_IDS.PHLEBOTOMY_BOOKING,
      ];

      act(() => {
        result.current.syncFlow(newSteps, TEST_USER_ID);
      });

      // Should go to first step
      expect(result.current.currentStep).toBe(STEP_IDS.UPDATE_INFO);
      expect(result.current.validSteps).toEqual(newSteps);
    });

    it('updates step flags correctly when valid steps change', () => {
      const { result } = renderHook(() => useOnboardingFlowStore());

      act(() => {
        result.current.syncFlow(TEST_STEPS, TEST_USER_ID);
      });

      // Navigate to middle step
      act(() => {
        result.current.next();
      });
      expect(result.current.isFirstStep).toBe(false);
      expect(result.current.isLastStep).toBe(false);

      // Update steps to make current step the last one
      const newSteps: StepId[] = [STEP_IDS.UPDATE_INFO, STEP_IDS.INTAKE];

      act(() => {
        result.current.syncFlow(newSteps, TEST_USER_ID);
      });

      expect(result.current.currentStep).toBe(STEP_IDS.INTAKE);
      expect(result.current.isLastStep).toBe(true);
      expect(result.current.isFirstStep).toBe(false);
    });
  });

  describe('navigation through all steps', () => {
    it('can navigate forward through all steps', () => {
      const { result } = renderHook(() => useOnboardingFlowStore());

      act(() => {
        result.current.syncFlow(TEST_STEPS, TEST_USER_ID);
      });

      expect(result.current.currentStep).toBe(STEP_IDS.UPDATE_INFO);
      expect(result.current.isFirstStep).toBe(true);
      expect(result.current.isLastStep).toBe(false);

      act(() => {
        result.current.next();
      });

      expect(result.current.currentStep).toBe(STEP_IDS.INTAKE);
      expect(result.current.isFirstStep).toBe(false);
      expect(result.current.isLastStep).toBe(false);

      act(() => {
        result.current.next();
      });

      expect(result.current.currentStep).toBe(STEP_IDS.PHLEBOTOMY_BOOKING);
      expect(result.current.isFirstStep).toBe(false);
      expect(result.current.isLastStep).toBe(true);
    });

    it('can navigate backward through all steps', () => {
      const { result } = renderHook(() => useOnboardingFlowStore());

      act(() => {
        result.current.syncFlow(TEST_STEPS, TEST_USER_ID);
      });

      // Go to last step
      act(() => {
        result.current.goTo(STEP_IDS.PHLEBOTOMY_BOOKING);
      });

      expect(result.current.currentStep).toBe(STEP_IDS.PHLEBOTOMY_BOOKING);

      act(() => {
        result.current.prev();
      });

      expect(result.current.currentStep).toBe(STEP_IDS.INTAKE);

      act(() => {
        result.current.prev();
      });

      expect(result.current.currentStep).toBe(STEP_IDS.UPDATE_INFO);
    });
  });
});
