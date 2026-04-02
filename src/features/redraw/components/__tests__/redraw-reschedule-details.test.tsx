import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { OrderStatus, type RequestGroup } from '@/types/api';

import { RedrawRescheduleDetails } from '../redraw-reschedule-details';

vi.mock('@/features/orders/components/appointment-details', () => ({
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

describe('RedrawRescheduleDetails', () => {
  it('shows scheduled redraw actions and appointment details', async () => {
    const setMode = vi.fn();
    const requestGroup = makeRequestGroup();

    render(
      <RedrawRescheduleDetails
        requestGroup={requestGroup}
        redrawOrder={requestGroup.orders[0]}
        setMode={setMode}
      />,
    );

    const rescheduleButton = screen.getByRole('button', {
      name: /reschedule recollection/i,
    });
    const cancelButton = screen.getByRole('button', {
      name: /cancel appointment/i,
    });

    expect(screen.getByText('RECOLLECTION')).toBeInTheDocument();
    expect(rescheduleButton).toBeEnabled();
    expect(cancelButton).toBeEnabled();
    expect(screen.getByText('Mar 30th, 2026')).toBeInTheDocument();
    expect(screen.getByText('2026-03-30T14:00:00.000Z')).toBeInTheDocument();
    expect(screen.getByText('2026-03-30T14:20:00.000Z')).toBeInTheDocument();
    expect(
      screen.getByText('12344 Barker Cypress Rd Ste 170'),
    ).toBeInTheDocument();
    expect(screen.getByText('Cypress')).toBeInTheDocument();
    expect(screen.getByText('America/Chicago')).toBeInTheDocument();
    expect(screen.getByText('REDRAW123')).toBeInTheDocument();

    await userEvent.click(rescheduleButton);
    await userEvent.click(cancelButton);

    expect(setMode).toHaveBeenNthCalledWith(1, 'reschedule');
    expect(setMode).toHaveBeenNthCalledWith(2, 'cancel');
  });
});

function makeRequestGroup(): RequestGroup {
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
        hasRedraw: true,
        redrawStatus: 'scheduled',
        redrawDetails: {
          startTimestamp: '2026-03-30T14:00:00.000Z',
          endTimestamp: '2026-03-30T14:20:00.000Z',
          timezone: 'America/Chicago',
          confirmationCode: 'REDRAW123',
          appointmentType: 'SCHEDULED',
          collectionMethod: 'IN_LAB',
          address: {
            id: 'addr-redraw-1',
            line: ['12344 Barker Cypress Rd Ste 170'],
            city: 'Cypress',
            state: 'TX',
            postalCode: '77429',
            use: 'old',
          },
        },
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
