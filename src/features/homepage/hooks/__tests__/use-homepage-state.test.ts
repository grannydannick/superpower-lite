import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useOrders } from '@/features/orders/api';
import { useCredits } from '@/features/orders/api/credits';
import { useWearables } from '@/features/settings/api/get-wearables';
import { useIsMobile } from '@/hooks/use-mobile';
import { useUser } from '@/lib/auth';
import type { User } from '@/types/api';

import { useHomepageState } from '../use-homepage-state';

vi.mock('@/features/orders/api', () => ({
  useOrders: vi.fn(),
}));

vi.mock('@/features/orders/api/credits', () => ({
  useCredits: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  useUser: vi.fn(),
}));

vi.mock('@/features/settings/api/get-wearables', () => ({
  useWearables: vi.fn(),
}));

vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: vi.fn(),
}));

const useOrdersMock = vi.mocked(useOrders, { partial: true });
const useCreditsMock = vi.mocked(useCredits, { partial: true });
const useUserMock = vi.mocked(useUser, { partial: true });
const useWearablesMock = vi.mocked(useWearables, { partial: true });
const useIsMobileMock = vi.mocked(useIsMobile, { partial: true });

const mockUserWithResultsGate = (resultsGate: User['resultsGate']): User =>
  ({ resultsGate }) as User;

describe('useHomepageState', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    useOrdersMock.mockReturnValue({
      data: { requestGroups: [] },
      isLoading: false,
    });

    useCreditsMock.mockReturnValue({
      data: { credits: [] },
      isLoading: false,
    });

    useUserMock.mockReturnValue({
      data: undefined,
      isLoading: false,
    });

    useWearablesMock.mockReturnValue({
      data: { wearables: [] },
      isLoading: false,
    });

    useIsMobileMock.mockReturnValue(false);
  });

  it('treats available redraws as actionable dashboard tasks', () => {
    useCreditsMock.mockReturnValue({
      data: {
        credits: [
          {
            id: 'credit-1',
            serviceId: 'service-1',
            serviceName: 'Superpower Blood Panel',
          },
        ],
      },
      isLoading: false,
    });

    const { result } = renderHook(() => useHomepageState(), {
      wrapper: createWrapper(),
    });

    expect(result.current.state.hasActionableOrders).toBe(true);
    expect(
      result.current.visibleCards.some((card) => card.id === 'actionableCards'),
    ).toBe(true);
  });

  it('keeps the actionable task card registered even when there are no current tasks', () => {
    const { result } = renderHook(() => useHomepageState(), {
      wrapper: createWrapper(),
    });

    expect(
      result.current.visibleCards.some((card) => card.id === 'actionableCards'),
    ).toBe(true);
  });

  it('sets hasFinalResults to true when summary has a final diagnostic report', () => {
    useUserMock.mockReturnValue({
      data: mockUserWithResultsGate({
        hasFinalDiagnosticReport: true,
        hasPartialResults: false,
        hasUserUploadedResults: false,
      }),
      isLoading: false,
    });

    const { result } = renderHook(() => useHomepageState(), {
      wrapper: createWrapper(),
    });

    expect(result.current.state.hasFinalResults).toBe(true);
  });

  it('sets hasFinalResults to true when summary only has uploaded results', () => {
    useUserMock.mockReturnValue({
      data: mockUserWithResultsGate({
        hasFinalDiagnosticReport: false,
        hasPartialResults: false,
        hasUserUploadedResults: true,
      }),
      isLoading: false,
    });

    const { result } = renderHook(() => useHomepageState(), {
      wrapper: createWrapper(),
    });

    expect(result.current.state.hasFinalResults).toBe(true);
  });

  it('sets hasFinalResults to false when summary has no final diagnostic report', () => {
    useUserMock.mockReturnValue({
      data: mockUserWithResultsGate({
        hasFinalDiagnosticReport: false,
        hasPartialResults: true,
        hasUserUploadedResults: false,
      }),
      isLoading: false,
    });

    const { result } = renderHook(() => useHomepageState(), {
      wrapper: createWrapper(),
    });

    expect(result.current.state.hasFinalResults).toBe(false);
  });

  it('sets hasFinalResults to false when summary data is undefined', () => {
    useUserMock.mockReturnValue({
      data: undefined,
      isLoading: false,
    });

    const { result } = renderHook(() => useHomepageState(), {
      wrapper: createWrapper(),
    });

    expect(result.current.state.hasFinalResults).toBe(false);
  });
});

function createWrapper() {
  const queryClient = new QueryClient();

  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(
      QueryClientProvider,
      { client: queryClient },
      children,
    );
  };
}
