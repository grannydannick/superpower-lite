import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { renderApp, userEvent } from '@/testing/test-utils';

import { RedrawScheduleFlow } from '../redraw-schedule-flow';

vi.mock('@/features/orders/components/schedule/in-lab-scheduler', async () => {
  const { useScheduleStore } =
    await import('@/features/orders/stores/schedule-store');

  return {
    InLabScheduler: () => {
      const { updateLocation, updateSlot, updateTz } = useScheduleStore(
        (store) => store,
      );

      return (
        <button
          type="button"
          onClick={() => {
            updateLocation({
              name: 'quest',
              address: {
                id: 'address-1',
                line: ['100 West Lincoln Street'],
                city: 'Phoenix',
                state: 'AZ',
                postalCode: '85004',
                use: 'home',
              },
              capabilities: ['APPOINTMENT_SCHEDULING'],
              slots: [],
            });
            updateSlot({
              start: '2026-03-24T12:00:00.000Z',
              end: '2026-03-24T12:15:00.000Z',
            });
            updateTz('America/Chicago');
          }}
        >
          Choose in-lab appointment
        </button>
      );
    },
  };
});

vi.mock('@/features/orders/components/schedule/at-home-scheduler', async () => {
  const { useScheduleStore } =
    await import('@/features/orders/stores/schedule-store');

  return {
    AtHomeScheduler: () => {
      const { updateLocation, updateSlot, updateTz } = useScheduleStore(
        (store) => store,
      );

      return (
        <button
          type="button"
          onClick={() => {
            updateLocation({
              name: 'home',
              address: {
                id: 'address-2',
                line: ['100 West Washington Street'],
                city: 'Phoenix',
                state: 'AZ',
                postalCode: '85003',
                use: 'home',
              },
              capabilities: ['APPOINTMENT_SCHEDULING'],
              slots: [],
            });
            updateSlot({
              start: '2026-03-31T13:00:00.000Z',
              end: '2026-03-31T13:15:00.000Z',
            });
            updateTz('America/Phoenix');
          }}
        >
          Choose at-home appointment
        </button>
      );
    },
  };
});

vi.mock('@/features/orders/components/appointment-details', () => {
  return {
    AppointmentDetails: ({
      collectionMethod,
      location,
    }: {
      collectionMethod?: string;
      location?: { address?: { city?: string } };
    }) => (
      <div>
        Appointment details {collectionMethod} {location?.address?.city}
      </div>
    ),
  };
});

describe('RedrawScheduleFlow', () => {
  it('uses the in-lab scheduler and submits the selected redraw appointment', async () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    const onBack = vi.fn();

    await renderApp(
      <RedrawScheduleFlow
        redraw={{
          serviceRequestId: 'sr-redraw-1',
          collectionMethod: 'IN_LAB',
          serviceName: 'Advanced Blood Panel',
          serviceNames: ['Advanced Blood Panel'],
        }}
        onBack={onBack}
        onConfirm={onConfirm}
      />,
      { user: null },
    );

    expect(
      screen.getByRole('heading', {
        name: /select a time & location for your visit/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /choose in-lab appointment/i }),
    ).toBeInTheDocument();

    const nextButton = screen.getByRole('button', { name: /^next$/i });
    expect(nextButton).toBeDisabled();

    await userEvent.click(
      screen.getByRole('button', { name: /choose in-lab appointment/i }),
    );

    expect(nextButton).toBeEnabled();

    await userEvent.click(nextButton);

    expect(
      screen.getByRole('heading', { name: /confirm appointment/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/appointment details in_lab phoenix/i),
    ).toBeVisible();

    await userEvent.click(screen.getByRole('button', { name: /^confirm$/i }));

    await waitFor(() =>
      expect(onConfirm).toHaveBeenCalledWith({
        timestamp: '2026-03-24T12:00:00.000Z',
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
  });

  it('uses the at-home scheduler and shows the at-home scheduling copy', async () => {
    await renderApp(
      <RedrawScheduleFlow
        redraw={{
          serviceRequestId: 'sr-redraw-1',
          collectionMethod: 'AT_HOME',
          serviceName: 'Advanced Blood Panel',
          serviceNames: ['Advanced Blood Panel'],
        }}
        onBack={() => undefined}
        onConfirm={async () => undefined}
      />,
      { user: null },
    );

    expect(
      screen.getByText(/your nurse will arrive during the selected time slot/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /choose at-home appointment/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /choose in-lab appointment/i }),
    ).not.toBeInTheDocument();
  });
});
