import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { OrderStatus, type RequestGroup } from '@/types/api';

import { useAppointmentManagement } from '../../hooks/use-appointment-management';

import { RescheduleDetails } from './reschedule-details';

vi.mock('../../hooks/use-appointment-management', () => ({
  useAppointmentManagement: vi.fn(() => ({
    canManageAppointment: false,
  })),
}));

vi.mock('../appointment-details', () => ({
  AppointmentDetails: ({
    slot,
    location,
    timezone,
    confirmationCode,
  }: {
    slot?: { start: string; end: string };
    location?: { address?: { line: string[]; city: string } };
    timezone?: string;
    confirmationCode?: string;
  }) => (
    <div>
      <div>Appointment details</div>
      <div>{slot?.start}</div>
      <div>{slot?.end}</div>
      <div>{location?.address?.line.join(' ')}</div>
      <div>{location?.address?.city}</div>
      <div>{timezone}</div>
      <div>{confirmationCode}</div>
    </div>
  ),
}));

vi.mock('@/components/ui/progressive-image', () => ({
  ProgressiveImage: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

const useAppointmentManagementMock = vi.mocked(useAppointmentManagement);

describe('RescheduleDetails', () => {
  it('uses the normal order view when redraw is not scheduled', async () => {
    const setMode = vi.fn();
    useAppointmentManagementMock.mockReturnValue({
      canManageAppointment: true,
    });

    render(
      <RescheduleDetails
        requestGroup={makeRequestGroup({ hasRedraw: true })}
        setMode={setMode}
      />,
    );

    expect(
      screen.getByRole('heading', {
        name: 'Superpower Blood Panel',
      }),
    ).toBeInTheDocument();
    expect(screen.queryByText('RECOLLECTION')).not.toBeInTheDocument();

    const rescheduleButton = screen.getByRole('button', {
      name: /reschedule test/i,
    });
    const cancelButton = screen.getByRole('button', {
      name: /cancel appointment/i,
    });

    expect(rescheduleButton).toBeEnabled();
    expect(cancelButton).toBeEnabled();

    await userEvent.click(rescheduleButton);
    await userEvent.click(cancelButton);

    expect(setMode).toHaveBeenNthCalledWith(1, 'reschedule');
    expect(setMode).toHaveBeenNthCalledWith(2, 'cancel');
  });
});

function makeRequestGroup({ hasRedraw }: { hasRedraw: boolean }): RequestGroup {
  return {
    id: 'rg-redraw-1',
    status: OrderStatus.active,
    appointmentType: 'SCHEDULED',
    collectionMethod: 'IN_LAB',
    createdAt: '2026-03-24T12:00:00.000Z',
    startTimestamp: '2026-03-24T14:00:00.000Z',
    endTimestamp: '2026-03-24T14:15:00.000Z',
    timezone: 'America/Chicago',
    orders: [
      {
        id: 'sr-redraw-1',
        serviceId: 'superpower-blood-panel',
        serviceName: 'Superpower Blood Panel',
        status: OrderStatus.active,
        hasRedraw,
        redrawStatus: hasRedraw ? 'requisition_created' : undefined,
      },
    ],
    address: {
      id: 'addr-default-1',
      line: ['100 West Lincoln Street'],
      city: 'Phoenix',
      state: 'AZ',
      postalCode: '85004',
      use: 'old',
    },
  };
}
