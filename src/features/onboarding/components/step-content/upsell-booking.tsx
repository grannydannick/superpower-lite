import React from 'react';

import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger,
  AlertDialogHeader,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Body1, H2 } from '@/components/ui/typography';
import { ImageContentLayout } from '@/features/onboarding/components/layouts';
import { useOrders } from '@/features/orders/api';
import { HealthcareServiceDialog } from '@/features/orders/components/healthcare-service-dialog';
import { useService } from '@/features/services/api';
import { useUser } from '@/lib/auth';
import { useStepper } from '@/lib/stepper';
import { Order } from '@/types/api';

const OrderCard = ({ order }: { order: Order }) => {
  const { data } = useService({
    serviceId: order.serviceId,
    method: null,
  });

  return (
    <div className="flex w-full items-center justify-between rounded-3xl bg-zinc-100 p-4">
      <div className="flex items-center gap-4">
        <Body1>{order.name}</Body1>
      </div>
      {data?.service ? (
        <HealthcareServiceDialog healthcareService={data?.service}>
          <Button>Book</Button>
        </HealthcareServiceDialog>
      ) : (
        <Skeleton className="h-[56px] w-[101px]" />
      )}
    </div>
  );
};

const UpsellBooking = () => {
  const { data: user } = useUser();
  const { data } = useOrders();
  const nextOnboardingStep = useStepper((s) => s.nextOnboardingStep);

  const draftOrders = data?.orders.filter((o) => o.status === 'DRAFT') ?? [];

  return (
    <div className="space-y-8 p-6 md:p-14">
      <div className="space-y-4">
        <H2>
          Thank you, {user?.firstName}. Would you like to schedule your
          additional services now?
        </H2>
        <Body1 className="text-zinc-500">
          Get your test results as soon as possible so your clinician can
          provide the most comprehensive analysis of your health.
        </Body1>
      </div>

      <div className="space-y-2">
        {draftOrders.map((o) => (
          <OrderCard order={o} key={o.id} />
        ))}
      </div>

      <div className="flex items-center justify-end gap-2 py-10">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline">Skip for now</Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="p-6">
            <AlertDialogHeader>
              <AlertDialogTitle>Heads up!</AlertDialogTitle>
              <AlertDialogDescription>
                You can always book these services by visiting the /services
                page and selecting the “To Be Scheduled” tab. We won’t charge
                you again, and you’ll be able to choose a time that works best
                for you.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  user ? nextOnboardingStep(user.onboarding.id) : undefined
                }
              >
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export const UpsellBookingStep = () => (
  <ImageContentLayout title="Booking">
    <UpsellBooking />
  </ImageContentLayout>
);
