import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useServices } from '@/features/services/api';
import { OrderStatus, type RequestGroup } from '@/types/api';

import { RequestGroupCard } from './request-group-card';

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

vi.mock('@/features/services/api', () => ({
  useServices: vi.fn(),
}));

const useServicesMock = vi.mocked(useServices, { partial: true });

describe('RequestGroupCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    navigateMock.mockReset();

    useServicesMock.mockReturnValue({
      data: {
        services: [],
      },
    });
  });

  it('shows a recollection badge for redraw orders', async () => {
    const requestGroups: RequestGroup[] = [
      {
        id: 'rg-redraw-1',
        status: OrderStatus.active,
        orders: [
          {
            id: 'sr-redraw-1',
            serviceId: 'superpower-blood-panel',
            serviceName: 'Superpower Blood Panel',
            status: OrderStatus.active,
            hasRedraw: true,
            redrawStatus: 'scheduled',
            createdAt: '2026-03-24T12:00:00.000Z',
          },
        ],
      },
    ];

    render(<RequestGroupCard requestGroups={requestGroups} />);

    expect(screen.getByText('Superpower Blood Panel')).toBeInTheDocument();
    expect(screen.getByText('RECOLLECTION')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /manage/i }));

    expect(navigateMock).toHaveBeenCalledWith({
      to: '/orders/$id',
      params: { id: 'rg-redraw-1' },
    });
  });

  it('shows the redraw appointment date for scheduled redraw orders', () => {
    const requestGroups: RequestGroup[] = [
      {
        id: 'rg-redraw-1',
        status: OrderStatus.active,
        startTimestamp: '2026-04-10T12:00:00.000Z',
        timezone: 'America/Chicago',
        orders: [
          {
            id: 'sr-redraw-1',
            serviceId: 'superpower-blood-panel',
            serviceName: 'Superpower Blood Panel',
            status: OrderStatus.active,
            hasRedraw: true,
            redrawStatus: 'scheduled',
            createdAt: '2026-03-28T12:00:00.000Z',
            redrawDetails: {
              startTimestamp: '2026-04-03T12:00:00.000Z',
              timezone: 'America/Chicago',
            },
          },
        ],
      },
    ];

    render(<RequestGroupCard requestGroups={requestGroups} />);

    expect(screen.getByText('Scheduled for: Apr 3, 2026')).toBeInTheDocument();
    expect(
      screen.queryByText('Scheduled for: Apr 10, 2026'),
    ).not.toBeInTheDocument();
  });

  it('does not show a recollection badge when the redraw is not scheduled', () => {
    const requestGroups: RequestGroup[] = [
      {
        id: 'rg-redraw-1',
        status: OrderStatus.active,
        orders: [
          {
            id: 'sr-redraw-1',
            serviceId: 'superpower-blood-panel',
            serviceName: 'Superpower Blood Panel',
            status: OrderStatus.active,
            hasRedraw: true,
            redrawStatus: 'requisition_created',
            createdAt: '2026-03-24T12:00:00.000Z',
          },
        ],
      },
    ];

    render(<RequestGroupCard requestGroups={requestGroups} />);

    expect(screen.getByText('Superpower Blood Panel')).toBeInTheDocument();
    expect(screen.queryByText('RECOLLECTION')).not.toBeInTheDocument();
  });
});
