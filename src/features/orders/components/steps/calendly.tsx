import { useState } from 'react';

import { CalendlyScheduler } from '@/components/shared/calendly-scheduler';
import { Button } from '@/components/ui/button';
import { DialogClose } from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { Body1, H2 } from '@/components/ui/typography';
import { env } from '@/config/env';
import { fetchCalendlyEvent } from '@/features/orders/api/get-calendly-event';
import { useUpdateOrder } from '@/features/orders/api/update-order';
import { useOrder } from '@/features/orders/stores/order-store';
import { useGetSchedulingLink } from '@/features/services/api/get-scheduling-link';
import { useUser } from '@/lib/auth';
import { OrderStatus, WebAddressType } from '@/types/api';
import { CalendlyScheduledEventInfo } from '@/types/calendly';

export function Calendly(): JSX.Element {
  const { data: user } = useUser();
  const { service, createdOrderId } = useOrder((s) => s);
  const updateOrderMutation = useUpdateOrder();
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getSchedulingLinkQuery = useGetSchedulingLink();

  if (getSchedulingLinkQuery.isLoading) {
    return (
      <div>
        <Spinner />
      </div>
    );
  }

  if (getSchedulingLinkQuery.data?.link === undefined) {
    return (
      <div>
        <h1 className="text-2xl">
          There was an issue booking your advisory call. Please contact
          concierge.
        </h1>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4 p-6 md:p-14">
        <div className="space-y-4">
          <H2>When are you free?</H2>
          <CalendlyScheduler
            token={env.CALENDLY_TOKEN}
            url={getSchedulingLinkQuery.data.link}
            onComplete={async (data: CalendlyScheduledEventInfo) => {
              setLoading(true);
              let location;
              const orderId = data.uri.split('/').at(-1);

              if (!data.location.join_url) {
                try {
                  location = await fetchCalendlyEvent(
                    orderId,
                    env.CALENDLY_TOKEN,
                  );
                } catch (error) {
                  console.error('Error fetching web address:', error);
                }
              } else {
                location = {
                  webAddress: {
                    url: data.location?.join_url,
                    type: 'ZOOM' as WebAddressType, // Assuming WebAddressType is predefined somewhere else
                  },
                };
              }

              if (service === null)
                throw Error('There was a problem creating the order.');

              if (createdOrderId === null)
                throw Error('Initial order was not created for this.');

              const result = await updateOrderMutation.mutateAsync({
                orderId: createdOrderId,
                data: {
                  location: location,
                  timestamp: data.start_time,
                  status: 'PENDING' as OrderStatus,
                },
              });

              if (!result.order) {
                setError('Failed to create order.');
              }

              setLoading(false);
              setSuccess(true);
            }}
            autoFill={{
              firstName: user?.firstName ?? '',
              lastName: user?.lastName ?? '',
              email: user?.email ?? '',
              phoneNumber: user?.phone ?? '',
            }}
          />
        </div>
      </div>
      <div className="flex items-center justify-between px-6 pb-12 md:px-14">
        <Body1 className="text-pink-700">{error}</Body1>
        <div className="flex w-full items-center gap-2">
          <DialogClose asChild>
            <Button disabled={!success || loading} className="w-full md:w-auto">
              {loading ? <Spinner /> : 'Done'}
            </Button>
          </DialogClose>
        </div>
      </div>
    </>
  );
}
