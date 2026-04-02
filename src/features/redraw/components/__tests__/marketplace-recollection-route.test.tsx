import {
  RouterProvider,
  createMemoryHistory,
  createRouter,
} from '@tanstack/react-router';
import { render, screen, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { AppProvider } from '@/app/provider';
import { toast } from '@/components/ui/sonner';
import { useOrders } from '@/features/orders/api';
import { revealLatestQueryOptions } from '@/features/protocol/api/reveal';
import { useRedraws } from '@/features/redraw/api/get-redraws';
import { useScheduleRedraw } from '@/features/redraw/api/schedule-redraw';
import { useSkipRedraw } from '@/features/redraw/api/skip-redraw';
import { getTaskQueryOptions } from '@/features/tasks/api/get-task';
import { authenticatedUserQueryOptions } from '@/lib/auth';
import { queryClient } from '@/lib/react-query';
import { routeTree } from '@/routeTree.gen';
import { userEvent } from '@/testing/test-utils';
import type { User } from '@/types/api';

vi.mock('@/features/redraw/api/get-redraws', () => {
  return {
    useRedraws: vi.fn(),
  };
});

vi.mock('@/features/orders/api', () => {
  return {
    useOrders: vi.fn(),
    getOrdersQueryOptions: () => ({ queryKey: ['orders'] }),
  };
});

vi.mock('@/features/redraw/api/skip-redraw', () => {
  return {
    useSkipRedraw: vi.fn(),
  };
});

vi.mock('@/features/redraw/api/schedule-redraw', () => {
  return {
    useScheduleRedraw: vi.fn(),
  };
});

vi.mock('@/features/redraw/components/redraw-schedule-flow', () => {
  return {
    RedrawScheduleFlow: ({
      onConfirm,
      redraw,
    }: {
      onConfirm: (payload: {
        timestamp: string;
        timezone: string;
        address: {
          id: string;
          line: string[];
          city: string;
          state: string;
          postalCode: string;
          use: 'home';
        };
      }) => Promise<void> | void;
      redraw: { collectionMethod?: string };
    }) => (
      <div>
        <h1>Redraw schedule flow</h1>
        <div>{redraw.collectionMethod}</div>
        <button
          type="button"
          onClick={() => {
            void onConfirm({
              timestamp: '2026-03-24T14:00:00.000Z',
              timezone: 'America/Chicago',
              address: {
                id: 'address-1',
                line: ['100 West Lincoln Street'],
                city: 'Phoenix',
                state: 'AZ',
                postalCode: '85004',
                use: 'home',
              },
            });
          }}
        >
          Confirm redraw schedule
        </button>
      </div>
    ),
  };
});

vi.mock('@/components/ui/sonner', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/components/ui/sonner')>();

  return {
    ...actual,
    toast: {
      ...actual.toast,
      success: vi.fn(),
      error: vi.fn(),
    },
  };
});

vi.mock('@/components/layouts', () => {
  return {
    ContentLayout: ({
      children,
      title,
    }: PropsWithChildren<{ title?: string }>) => (
      <div>
        {title ? <h1>{title}</h1> : null}
        {children}
      </div>
    ),
  };
});

vi.mock('@/components/layouts/app-layout', () => {
  return {
    AppLayout: ({ children }: PropsWithChildren) => <div>{children}</div>,
  };
});

vi.mock('@/components/shared/header', () => {
  return {
    Header: ({ title }: { title: string }) => <h1>{title}</h1>,
  };
});

vi.mock('@/components/shared/floating-wrapper', () => {
  return {
    FloatingWrapper: () => null,
  };
});

vi.mock('@/components/shared/navbar', () => {
  return {
    Navbar: () => null,
  };
});

vi.mock('@/features/announcements/components/announcements', () => {
  return {
    Announcements: () => null,
  };
});

vi.mock('@/features/marketplace/components/marketplace-cta', () => {
  return {
    MarketplaceCta: () => null,
  };
});

vi.mock('@/features/marketplace/components/marketplace-tabs', () => {
  return {
    MarketplaceTabs: () => <div>Marketplace tabs</div>,
  };
});

const useRedrawsMock = vi.mocked(useRedraws, { partial: true });
const useOrdersMock = vi.mocked(useOrders, { partial: true });
const useSkipRedrawMock = vi.mocked(useSkipRedraw, { partial: true });
const useScheduleRedrawMock = vi.mocked(useScheduleRedraw, { partial: true });

const testUser: User = {
  id: 'user-1',
  username: 'user-1',
  firstName: 'Test',
  lastName: 'User',
  createdAt: new Date().toISOString(),
  email: 'test@example.com',
  phone: '5555555555',
  dateOfBirth: '1990-01-01',
  gender: 'male',
  subscribed: true,
  admin: false,
  authMethod: 'password',
  address: [],
  adminActor: undefined,
  role: ['MEMBER'],
};

async function renderMarketplaceRoute(url: string) {
  queryClient.setQueryData(authenticatedUserQueryOptions().queryKey, testUser);
  queryClient.setQueryData(getTaskQueryOptions('onboarding').queryKey, {
    task: {
      name: 'onboarding',
      reason: 'onboarding complete',
      status: 'completed',
    },
  });
  queryClient.setQueryData(revealLatestQueryOptions().queryKey, {
    shouldShow: false,
    lastCompletedPhase: 'completed',
  });

  const router = createRouter({
    routeTree,
    history: createMemoryHistory({
      initialEntries: [url],
    }),
    context: {
      queryClient,
    },
    defaultPendingMs: 0,
    defaultPendingMinMs: 0,
  });

  await router.load({ sync: true });

  render(<RouterProvider router={router} />, {
    wrapper: ({ children }) => <AppProvider>{children}</AppProvider>,
  });
}

describe('recollection route', () => {
  it('renders the marketplace page at /marketplace', async () => {
    useScheduleRedrawMock.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useScheduleRedraw>);

    useSkipRedrawMock.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useSkipRedraw>);

    useRedrawsMock.mockReturnValue({
      data: { redraws: [] },
      isError: false,
      isLoading: false,
    } as unknown as ReturnType<typeof useRedraws>);
    useOrdersMock.mockReturnValue({
      data: { requestGroups: [] },
      isError: false,
      isLoading: false,
    } as unknown as ReturnType<typeof useOrders>);

    await renderMarketplaceRoute('/marketplace');

    expect(
      await screen.findAllByRole('heading', { name: /^marketplace$/i }),
    ).not.toHaveLength(0);
  });

  it('renders the recollection page for a redraw service request', async () => {
    useScheduleRedrawMock.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useScheduleRedraw>);

    useSkipRedrawMock.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useSkipRedraw>);

    useRedrawsMock.mockReturnValue({
      data: {
        redraws: [
          {
            serviceRequestId: 'sr-redraw-1',
            collectionMethod: 'IN_LAB',
            serviceName: 'Advanced Blood Panel',
            serviceNames: ['Advanced Blood Panel'],
            missingBiomarkers: ['Apolipoprotein B', 'Estradiol'],
          },
        ],
      },
      isError: false,
      isLoading: false,
    } as unknown as ReturnType<typeof useRedraws>);
    useOrdersMock.mockReturnValue({
      data: { requestGroups: [] },
      isError: false,
      isLoading: false,
    } as unknown as ReturnType<typeof useOrders>);

    await renderMarketplaceRoute('/recollection/sr-redraw-1');

    expect(
      await screen.findByRole('heading', {
        name: /free redraw available/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: /^marketplace$/i }),
    ).not.toBeInTheDocument();
  });

  it('skips the redraw for the current service request and shows a toast', async () => {
    useScheduleRedrawMock.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useScheduleRedraw>);

    const mutateAsync = vi
      .fn()
      .mockResolvedValue({ message: 'Redraw skipped' });

    useSkipRedrawMock.mockReturnValue({
      mutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useSkipRedraw>);

    useRedrawsMock.mockReturnValue({
      data: {
        redraws: [
          {
            serviceRequestId: 'sr-redraw-1',
            collectionMethod: 'IN_LAB',
            serviceName: 'Advanced Blood Panel',
            serviceNames: ['Advanced Blood Panel'],
            missingBiomarkers: ['Apolipoprotein B', 'Estradiol'],
          },
        ],
      },
      isError: false,
      isLoading: false,
    } as unknown as ReturnType<typeof useRedraws>);
    useOrdersMock.mockReturnValue({
      data: { requestGroups: [] },
      isError: false,
      isLoading: false,
    } as unknown as ReturnType<typeof useOrders>);

    await renderMarketplaceRoute('/recollection/sr-redraw-1');

    await userEvent.click(
      await screen.findByRole('button', { name: /skip redraw/i }),
    );
    await userEvent.click(screen.getByRole('checkbox'));
    await userEvent.click(screen.getByRole('button', { name: /^confirm$/i }));

    await waitFor(() =>
      expect(mutateAsync).toHaveBeenCalledWith('sr-redraw-1'),
    );
    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith('Recollection skipped!'),
    );
  });

  it('navigates from the recollection overview to the redraw schedule route', async () => {
    useScheduleRedrawMock.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useScheduleRedraw>);

    useSkipRedrawMock.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useSkipRedraw>);

    useRedrawsMock.mockReturnValue({
      data: {
        redraws: [
          {
            serviceRequestId: 'sr-redraw-1',
            collectionMethod: 'AT_HOME',
            serviceName: 'Advanced Blood Panel',
            serviceNames: ['Advanced Blood Panel'],
            missingBiomarkers: ['Apolipoprotein B', 'Estradiol'],
          },
        ],
      },
      isError: false,
      isLoading: false,
    } as unknown as ReturnType<typeof useRedraws>);
    useOrdersMock.mockReturnValue({
      data: { requestGroups: [] },
      isError: false,
      isLoading: false,
    } as unknown as ReturnType<typeof useOrders>);

    await renderMarketplaceRoute('/recollection/sr-redraw-1');

    await userEvent.click(
      await screen.findByRole('button', { name: /continue to book/i }),
    );

    expect(
      screen.getAllByRole('heading', {
        name: /prepare for your recollection/i,
      }).length,
    ).toBeGreaterThan(0);

    await userEvent.click(screen.getByRole('button', { name: /^continue$/i }));

    expect(
      await screen.findByRole('heading', { name: /redraw schedule flow/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('AT_HOME')).toBeInTheDocument();
  });

  it('schedules the redraw for the current service request and shows a toast', async () => {
    const mutateAsync = vi
      .fn()
      .mockResolvedValue({ message: 'Redraw scheduled' });

    useScheduleRedrawMock.mockReturnValue({
      mutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useScheduleRedraw>);

    useSkipRedrawMock.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useSkipRedraw>);

    useRedrawsMock.mockReturnValue({
      data: {
        redraws: [
          {
            serviceRequestId: 'sr-redraw-1',
            collectionMethod: 'IN_LAB',
            serviceName: 'Advanced Blood Panel',
            serviceNames: ['Advanced Blood Panel'],
            missingBiomarkers: ['Apolipoprotein B', 'Estradiol'],
          },
        ],
      },
      isError: false,
      isLoading: false,
    } as unknown as ReturnType<typeof useRedraws>);
    useOrdersMock.mockReturnValue({
      data: { requestGroups: [] },
      isError: false,
      isLoading: false,
    } as unknown as ReturnType<typeof useOrders>);

    await renderMarketplaceRoute('/recollection/sr-redraw-1/schedule');

    await userEvent.click(
      await screen.findByRole('button', { name: /confirm redraw schedule/i }),
    );

    await waitFor(() =>
      expect(mutateAsync).toHaveBeenCalledWith('sr-redraw-1', {
        timestamp: '2026-03-24T14:00:00.000Z',
        timezone: 'America/Chicago',
        address: {
          id: 'address-1',
          line: ['100 West Lincoln Street'],
          city: 'Phoenix',
          state: 'AZ',
          postalCode: '85004',
          use: 'home',
        },
      }),
    );
    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith('Recollection scheduled!'),
    );
  });

  it('renders the redraw schedule route from scheduled redraw orders when redraws api no longer includes it', async () => {
    const mutateAsync = vi
      .fn()
      .mockResolvedValue({ message: 'Redraw scheduled' });

    useScheduleRedrawMock.mockReturnValue({
      mutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useScheduleRedraw>);

    useSkipRedrawMock.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useSkipRedraw>);

    useRedrawsMock.mockReturnValue({
      data: { redraws: [] },
      isError: false,
      isLoading: false,
    } as unknown as ReturnType<typeof useRedraws>);

    useOrdersMock.mockReturnValue({
      data: {
        requestGroups: [
          {
            id: 'rg-redraw-1',
            collectionMethod: 'AT_HOME',
            orders: [
              {
                id: 'sr-redraw-1',
                serviceId: 'advanced-blood-panel',
                serviceName: 'Advanced Blood Panel',
                status: 'active',
                hasRedraw: true,
                redrawStatus: 'scheduled',
                collectionMethod: 'AT_HOME',
              },
            ],
          },
        ],
      },
      isError: false,
      isLoading: false,
    } as unknown as ReturnType<typeof useOrders>);

    await renderMarketplaceRoute('/recollection/sr-redraw-1/schedule');

    expect(
      await screen.findByRole('heading', { name: /redraw schedule flow/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('AT_HOME')).toBeInTheDocument();
  });
});
