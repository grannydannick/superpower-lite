import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { useOnboardingCartStore } from '../add-on-panels-cart-store';

describe('useOnboardingCartStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useOnboardingCartStore.getState().clear();
  });

  it('persists selected service ids as a string array', () => {
    const { result } = renderHook(() => useOnboardingCartStore());

    act(() => {
      result.current.addService('panel-a');
      result.current.addService('panel-b');
    });

    const stored = localStorage.getItem('onboarding-cart-store');
    expect(stored).not.toBeNull();

    let parsedState: unknown = null;
    if (stored !== null) {
      const parsed = JSON.parse(stored);
      if (typeof parsed === 'object' && parsed !== null && 'state' in parsed) {
        parsedState = parsed.state;
      }
    }

    expect(parsedState).toEqual({
      hasInitializedRecommendedSelections: false,
      selectedServiceIds: ['panel-a', 'panel-b'],
    });
  });

  it('rehydrates persisted service ids into a Set', async () => {
    localStorage.setItem(
      'onboarding-cart-store',
      JSON.stringify({
        state: {
          selectedServiceIds: ['panel-a', 'panel-b'],
        },
        version: 0,
      }),
    );

    await act(async () => {
      await useOnboardingCartStore.persist.rehydrate();
    });

    const { result } = renderHook(() => useOnboardingCartStore());
    expect(result.current.selectedServiceIds instanceof Set).toBe(true);
    expect(result.current.selectedServiceIds.size).toBe(2);
    expect(result.current.selectedServiceIds.has('panel-a')).toBe(true);
    expect(result.current.selectedServiceIds.has('panel-b')).toBe(true);
  });
});
