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

// Note: Zustand mock auto-resets stores after each test (see __mocks__/zustand.ts)
describe('useOnboardingFlowStore', () => {
  describe('initialize()', () => {
    it('sets currentStep to first step', () => {
      const { result } = renderHook(() => useOnboardingFlowStore());

      act(() => {
        result.current.initialize(TEST_STEPS);
      });

      expect(result.current.currentStep).toBe(STEP_IDS.UPDATE_INFO);
    });

    it('sets validSteps to provided steps', () => {
      const { result } = renderHook(() => useOnboardingFlowStore());

      act(() => {
        result.current.initialize(TEST_STEPS);
      });

      expect(result.current.validSteps).toEqual(TEST_STEPS);
    });

    it('sets isInitialized to true', () => {
      const { result } = renderHook(() => useOnboardingFlowStore());

      act(() => {
        result.current.initialize(TEST_STEPS);
      });

      expect(result.current.isInitialized).toBe(true);
    });

    it('handles empty steps array', () => {
      const { result } = renderHook(() => useOnboardingFlowStore());

      act(() => {
        result.current.initialize([]);
      });

      expect(result.current.currentStep).toBeNull();
      expect(result.current.validSteps).toEqual([]);
      expect(result.current.isInitialized).toBe(true);
    });

    it('handles single step', () => {
      const { result } = renderHook(() => useOnboardingFlowStore());

      act(() => {
        result.current.initialize([STEP_IDS.PHLEBOTOMY_BOOKING]);
      });

      expect(result.current.currentStep).toBe(STEP_IDS.PHLEBOTOMY_BOOKING);
      expect(result.current.validSteps).toEqual([STEP_IDS.PHLEBOTOMY_BOOKING]);
    });
  });

  describe('next()', () => {
    it('advances to next step', () => {
      const { result } = renderHook(() => useOnboardingFlowStore());

      act(() => {
        result.current.initialize(TEST_STEPS);
      });

      act(() => {
        result.current.next();
      });

      expect(result.current.currentStep).toBe(STEP_IDS.INTAKE);
    });

    it('does nothing on last step', () => {
      const { result } = renderHook(() => useOnboardingFlowStore());

      act(() => {
        result.current.initialize(TEST_STEPS);
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
        result.current.initialize(TEST_STEPS);
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
        result.current.initialize(TEST_STEPS);
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
        result.current.initialize(TEST_STEPS);
      });

      act(() => {
        result.current.goTo(STEP_IDS.PHLEBOTOMY_BOOKING);
      });

      expect(result.current.currentStep).toBe(STEP_IDS.PHLEBOTOMY_BOOKING);
    });

    it('does nothing with invalid stepId', () => {
      const { result } = renderHook(() => useOnboardingFlowStore());

      act(() => {
        result.current.initialize(TEST_STEPS);
      });

      const initialStep = result.current.currentStep;

      // Try to go to a step not in validSteps
      act(() => {
        result.current.goTo(STEP_IDS.COMMITMENT);
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
        result.current.initialize(TEST_STEPS);
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
        result.current.initialize(TEST_STEPS);
      });

      act(() => {
        result.current.goTo(STEP_IDS.PHLEBOTOMY_BOOKING);
      });

      expect(result.current.isLastStep).toBe(true);
    });

    it('returns false on non-last step', () => {
      const { result } = renderHook(() => useOnboardingFlowStore());

      act(() => {
        result.current.initialize(TEST_STEPS);
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
        result.current.initialize([STEP_IDS.PHLEBOTOMY_BOOKING]);
      });

      expect(result.current.isLastStep).toBe(true);
    });
  });

  describe('isFirstStep', () => {
    it('returns true on first step', () => {
      const { result } = renderHook(() => useOnboardingFlowStore());

      act(() => {
        result.current.initialize(TEST_STEPS);
      });

      expect(result.current.isFirstStep).toBe(true);
    });

    it('returns false on non-first step', () => {
      const { result } = renderHook(() => useOnboardingFlowStore());

      act(() => {
        result.current.initialize(TEST_STEPS);
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
        result.current.initialize([STEP_IDS.PHLEBOTOMY_BOOKING]);
      });

      expect(result.current.isFirstStep).toBe(true);
    });
  });

  describe('updateSteps()', () => {
    it('updates validSteps while keeping current step', () => {
      const { result } = renderHook(() => useOnboardingFlowStore());

      act(() => {
        result.current.initialize(TEST_STEPS);
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
        result.current.updateSteps(newSteps);
      });

      // Should still be on INTAKE
      expect(result.current.currentStep).toBe(STEP_IDS.INTAKE);
      expect(result.current.validSteps).toEqual(newSteps);
    });

    it('goes to first step if current step no longer valid', () => {
      const { result } = renderHook(() => useOnboardingFlowStore());

      act(() => {
        result.current.initialize(TEST_STEPS);
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
        result.current.updateSteps(newSteps);
      });

      // Should go to first step
      expect(result.current.currentStep).toBe(STEP_IDS.UPDATE_INFO);
      expect(result.current.validSteps).toEqual(newSteps);
    });

    it('updates step flags correctly', () => {
      const { result } = renderHook(() => useOnboardingFlowStore());

      act(() => {
        result.current.initialize(TEST_STEPS);
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
        result.current.updateSteps(newSteps);
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
        result.current.initialize(TEST_STEPS);
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
        result.current.initialize(TEST_STEPS);
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
