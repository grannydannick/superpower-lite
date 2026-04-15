import { useSuspenseQuery } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ActionableOrdersCard } from '../actionable-orders-card';

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

vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual<typeof import('@tanstack/react-query')>(
    '@tanstack/react-query',
  );
  return {
    ...actual,
    useSuspenseQuery: vi.fn(),
  };
  return { ...actual, useSuspenseQuery: vi.fn() };
});

vi.mock('@/features/orders/api/credits', () => ({
  getCreditsQueryOptions: vi.fn(() => ({ queryKey: ['credits', 'default'] })),
}));

vi.mock('@/features/orders/api/get-gifts', () => ({
  getGiftsQueryOptions: vi.fn(() => ({ queryKey: ['gifts'] })),
}));

vi.mock('@/features/redraw/api/get-redraws', () => ({
  getRedrawsQueryOptions: vi.fn(() => ({ queryKey: ['redraws'] })),
}));

const useSuspenseQueryMock = vi.mocked(useSuspenseQuery);

describe('ActionableOrdersCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    navigateMock.mockReset();

    useSuspenseQueryMock.mockImplementation(
      ({ queryKey }: { queryKey: readonly unknown[] }) => {
        if (queryKey[0] === 'credits')
          return { data: { credits: [] } } as ReturnType<
            typeof useSuspenseQuery
          >;
        else if (queryKey[0] == 'gifts')
          return { data: { gifts: [] } } as ReturnType<typeof useSuspenseQuery>;
        return { data: { redraws: [] } } as ReturnType<typeof useSuspenseQuery>;
      },
    );
  });

  it('renders a recollection task when an available redraw exists', async () => {
    useSuspenseQueryMock.mockImplementation(
      ({ queryKey }: { queryKey: readonly unknown[] }) => {
        if (queryKey[0] === 'credits')
          return { data: { credits: [] } } as ReturnType<
            typeof useSuspenseQuery
          >;
        return {
          data: {
            redraws: [
              {
                serviceRequestId: 'sr-redraw-1',
                serviceRequestIds: ['sr-redraw-1'],
                redrawStatus: 'requisition_created',
                serviceNames: ['Superpower Blood Panel'],
                missingBiomarkers: ['Apolipoprotein B'],
                canSchedule: true,
                canSkip: true,
                canCancel: false,
              },
            ],
          },
        } as ReturnType<typeof useSuspenseQuery>;
      },
    );

    render(<ActionableOrdersCard />);

    expect(screen.getByText('You have 1 task')).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', { name: /you have 1 task/i }),
    );

    expect(screen.getByText('Recollection Available')).toBeInTheDocument();
    expect(
      screen.getByText('Recollect your missing tests'),
    ).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', {
        name: /recollection available recollect your missing tests/i,
      }),
    );

    expect(navigateMock).toHaveBeenCalledWith({
      to: '/recollection/$serviceRequestId',
      params: { serviceRequestId: 'sr-redraw-1' },
    });
  });

  it('renders a gift action card when there are unsent gifts', async () => {
    useSuspenseQueryMock.mockReturnValue({
      data: {
        gifts: [
          { id: 'gift-1', sentGiftAt: null },
          { id: 'gift-2', sentGiftAt: '2026-01-01T00:00:00Z' },
        ],
      },
    } as any);

    render(<ActionableOrdersCard />);

    await userEvent.click(
      screen.getByRole('button', { name: /you have 1 task/i }),
    );

    expect(screen.getByText('Send your gift')).toBeInTheDocument();
  });

  it('does not render a gift action card when all gifts are sent', async () => {
    useSuspenseQueryMock.mockReturnValue({
      data: {
        gifts: [{ id: 'gift-1', sentGiftAt: '2026-01-01T00:00:00Z' }],
      },
    } as any);

    render(<ActionableOrdersCard />);

    expect(screen.queryByText('Send your gift')).not.toBeInTheDocument();
  });

  it('does not render a gift action card when there are no gifts', () => {
    render(<ActionableOrdersCard />);

    expect(screen.queryByText('Send your gift')).not.toBeInTheDocument();
  });
});
