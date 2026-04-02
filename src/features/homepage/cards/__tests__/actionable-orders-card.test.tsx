import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useCredits } from '@/features/orders/api/credits';
import { useRedraws } from '@/features/redraw/api/get-redraws';

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

vi.mock('@/features/orders/api/credits', () => ({
  useCredits: vi.fn(),
}));

vi.mock('@/features/redraw/api/get-redraws', () => ({
  useRedraws: vi.fn(),
}));

const useCreditsMock = vi.mocked(useCredits, { partial: true });
const useRedrawsMock = vi.mocked(useRedraws, { partial: true });

describe('ActionableOrdersCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    navigateMock.mockReset();

    useCreditsMock.mockReturnValue({
      data: {
        credits: [],
      },
    });

    useRedrawsMock.mockReturnValue({
      data: {
        redraws: [],
      },
    });
  });

  it('renders a recollection task when an available redraw exists', async () => {
    useRedrawsMock.mockReturnValue({
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
    });

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
});
