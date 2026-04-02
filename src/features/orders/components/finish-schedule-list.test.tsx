import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useCredits } from '@/features/orders/api/credits';
import { useRedraws } from '@/features/redraw/api/get-redraws';

import { FinishScheduleList } from './finish-schedule-list';

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

describe('FinishScheduleList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    navigateMock.mockReset();

    useCreditsMock.mockReturnValue({
      isLoading: false,
      data: {
        credits: [],
      },
    });

    useRedrawsMock.mockReturnValue({
      isLoading: false,
      data: {
        redraws: [],
      },
    });
  });

  it('shows redraw tasks on the orders page and navigates to recollection', async () => {
    useRedrawsMock.mockReturnValue({
      isLoading: false,
      data: {
        redraws: [
          {
            redrawOrderId: 'ro-redraw-1',
            serviceRequestId: 'sr-redraw-1',
            serviceRequestIds: ['sr-redraw-1'],
            serviceName: 'Superpower Blood Panel',
            serviceNames: ['Superpower Blood Panel'],
            redrawStatus: 'requisition_created',
            missingBiomarkers: ['Missing Biomarker 1'],
            canSchedule: true,
            canSkip: true,
            canCancel: false,
          },
        ],
      },
    });

    render(<FinishScheduleList />);

    expect(screen.getByText('Tasks')).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', { name: /you have 1 task/i }),
    );

    expect(screen.getByText('Recollection Available')).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', { name: /recollection available/i }),
    );

    expect(navigateMock).toHaveBeenCalledWith({
      to: '/recollection/$serviceRequestId',
      params: { serviceRequestId: 'sr-redraw-1' },
    });
  });

  it('does not render when there are no credits or redraw tasks', () => {
    const { container } = render(<FinishScheduleList />);

    expect(container).toBeEmptyDOMElement();
  });
});
