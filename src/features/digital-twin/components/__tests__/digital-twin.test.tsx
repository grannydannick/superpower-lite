import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useCheckPerformance } from '@/features/digital-twin/hooks/use-check-performance';
import { useUser } from '@/lib/auth';

import { DigitalTwin } from '../digital-twin';

vi.mock('@/lib/auth', () => ({
  useUser: vi.fn(),
}));

vi.mock('@/features/digital-twin/hooks/use-check-performance', () => ({
  useCheckPerformance: vi.fn(),
}));

vi.mock('../digital-twin-model', () => ({
  default: () => <div>Digital twin model</div>,
}));

const useUserMock = vi.mocked(useUser, { partial: true });
const useCheckPerformanceMock = vi.mocked(useCheckPerformance, {
  partial: true,
});

describe('DigitalTwin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useUserMock.mockReturnValue({
      data: {
        gender: 'male',
      },
      isLoading: false,
    } as ReturnType<typeof useUser>);

    useCheckPerformanceMock.mockReturnValue({
      isPerformanceSufficient: true,
      isLoading: false,
    });

    Object.defineProperty(window, 'requestIdleCallback', {
      configurable: true,
      writable: true,
      value: vi.fn((callback: IdleRequestCallback) => {
        callback({
          didTimeout: false,
          timeRemaining: () => 50,
        });
        return 1;
      }),
    });
  });

  it('does not restart cycling when rerendered with the same filter categories', async () => {
    const setIntervalSpy = vi.spyOn(globalThis, 'setInterval');
    const filterCategories = ['heart', 'metabolic'];

    const { rerender } = render(
      <DigitalTwin filterCategories={filterCategories} />,
    );

    await screen.findByText('Digital twin model');

    expect(setIntervalSpy).toHaveBeenCalledTimes(1);

    rerender(<DigitalTwin filterCategories={filterCategories} />);

    expect(setIntervalSpy).toHaveBeenCalledTimes(1);
  });
});
