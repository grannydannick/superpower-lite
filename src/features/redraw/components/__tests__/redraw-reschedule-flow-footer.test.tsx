import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { toast } from '@/components/ui/sonner';
import { useCancelRedraw } from '@/features/redraw/api/cancel-redraw';
import { OrderStatus, type RequestGroup } from '@/types/api';

import { RedrawRescheduleFlowFooter } from '../redraw-reschedule-flow-footer';

const navigateMock = vi.fn();
const invalidateQueriesMock = vi.fn();
const mutateAsyncMock = vi.fn();

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual<typeof import('@tanstack/react-router')>(
    '@tanstack/react-router',
  );

  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock('@/features/redraw/api/cancel-redraw', () => ({
  useCancelRedraw: vi.fn(),
}));

vi.mock('@/features/orders/api', () => ({
  getOrdersQueryOptions: () => ({ queryKey: ['orders'] }),
}));

vi.mock('@/features/redraw/api/get-redraws', () => ({
  getRedrawsQueryOptions: () => ({ queryKey: ['redraws'] }),
}));

vi.mock('@/components/ui/sonner', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/components/ui/sonner')>();

  return {
    ...actual,
    toast: {
      ...actual.toast,
      success: vi.fn(),
    },
  };
});

describe('RedrawRescheduleFlowFooter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    navigateMock.mockReset();
    invalidateQueriesMock.mockReset();
    mutateAsyncMock.mockReset();
    vi.mocked(useCancelRedraw).mockReturnValue({
      mutateAsync: mutateAsyncMock,
      isPending: false,
    } as unknown as ReturnType<typeof useCancelRedraw>);
  });

  it('navigates to the redraw scheduling flow when rescheduling a scheduled redraw', async () => {
    renderWithClient(
      <RedrawRescheduleFlowFooter
        mode="reschedule"
        setMode={vi.fn()}
        requestGroup={makeRequestGroup()}
      />,
    );

    await userEvent.click(
      screen.getByRole('button', { name: /confirm reschedule/i }),
    );

    expect(navigateMock).toHaveBeenCalledWith({
      to: '/recollection/$serviceRequestId/schedule',
      params: { serviceRequestId: 'sr-redraw-1' },
    });
    expect(mutateAsyncMock).not.toHaveBeenCalled();
  });

  it('cancels the redraw appointment and returns to orders when cancelling a scheduled redraw', async () => {
    mutateAsyncMock.mockResolvedValue({ message: 'Redraw cancelled' });

    renderWithClient(
      <RedrawRescheduleFlowFooter
        mode="cancel"
        setMode={vi.fn()}
        requestGroup={makeRequestGroup()}
      />,
    );

    await userEvent.click(
      screen.getByRole('button', { name: /confirm cancellation/i }),
    );

    await waitFor(() =>
      expect(mutateAsyncMock).toHaveBeenCalledWith('sr-redraw-1'),
    );
    expect(toast.success).toHaveBeenCalledWith(
      'Recollection appointment cancelled!',
    );
    expect(invalidateQueriesMock).toHaveBeenCalledTimes(2);
    expect(navigateMock).toHaveBeenCalledWith({ to: '/orders' });
  });
});

function renderWithClient(ui: ReactNode) {
  const queryClient = new QueryClient();
  queryClient.invalidateQueries =
    invalidateQueriesMock as typeof queryClient.invalidateQueries;

  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

function makeRequestGroup(): RequestGroup {
  return {
    id: 'rg-redraw-1',
    status: OrderStatus.active,
    appointmentType: 'SCHEDULED',
    collectionMethod: 'IN_LAB',
    orders: [
      {
        id: 'sr-redraw-1',
        serviceId: 'superpower-blood-panel',
        serviceName: 'Superpower Blood Panel',
        status: OrderStatus.active,
        hasRedraw: true,
        redrawStatus: 'scheduled',
      },
    ],
  };
}
