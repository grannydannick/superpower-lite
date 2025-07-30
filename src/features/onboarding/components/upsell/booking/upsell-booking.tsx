import { useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { Body1, H3 } from '@/components/ui/typography';
import { useOrders } from '@/features/orders/api';
import { useUpdateTask } from '@/features/tasks/api/update-task';
import { useUser } from '@/lib/auth';
import { useStepper } from '@/lib/stepper';

import { UPSELL_SERVICES } from '../../../const/upsell-services';
import { ItemPreviews } from '../item-previews';

import { BookingCard } from './booking-card';
import { SkipWarning } from './skip-warning';

export const UpsellBooking = () => {
  const { data: user } = useUser();
  const { data } = useOrders();
  const { nextStep, activeStep } = useStepper((s) => s);
  const { mutateAsync: updateTaskProgress, isError } = useUpdateTask();

  const updateStep = async () => {
    await updateTaskProgress({
      taskName: 'onboarding',
      data: { progress: activeStep + 1 },
    });

    if (!isError) {
      nextStep();
    }
  };

  const orders = useMemo(() => {
    const upsellNames = new Set(
      UPSELL_SERVICES.map((service) => service.item.name),
    );

    return data?.orders.filter((order) => upsellNames.has(order.name)) ?? [];
  }, [data]);

  const allServicesConfirmed = useMemo(() => {
    return orders.every((order) => order.status !== 'DRAFT');
  }, [orders]);

  return (
    <>
      <div className="mx-auto mb-16 flex size-full flex-col items-start px-6 md:mt-0 lg:max-w-[512px] lg:pt-16">
        <div className="mb-8 space-y-4">
          <H3>
            Thank you, {user?.firstName}. Would you like to schedule your
            additional services now?
          </H3>
          <Body1 className="text-zinc-500">
            Get your test results as soon as possible so your longevity advisor
            can provide the most comprehensive analysis of your health.
          </Body1>
        </div>

        {orders.length === 0 ? (
          <div className="flex w-full flex-col items-center justify-center space-y-2 rounded-lg border border-dashed border-zinc-200 bg-zinc-100 p-8">
            <Body1 className="font-medium text-gray-600">
              No more services to book
            </Body1>
          </div>
        ) : null}

        <div className="w-full space-y-2">
          {orders.map((o) => (
            <BookingCard order={o} key={o.id} />
          ))}
        </div>

        <div className="flex w-full items-center justify-end gap-2 py-10">
          {orders.length > 0 && !allServicesConfirmed ? (
            <SkipWarning>
              <Button variant="outline" className="bg-white">
                Skip for now
              </Button>
            </SkipWarning>
          ) : (
            <Button onClick={updateStep} className="w-full">
              Next
            </Button>
          )}
        </div>
      </div>
      <ItemPreviews />
    </>
  );
};
