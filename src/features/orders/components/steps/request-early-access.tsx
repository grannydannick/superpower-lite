import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { Body1, H2, H3 } from '@/components/ui/typography';
import { useCreateInteractionEvent } from '@/features/messages/api';
import { useOrder } from '@/features/orders/stores/order-store';

export const EarlyAccessContent = (): JSX.Element => {
  const [message, setMessage] = useState('');
  const { service } = useOrder((s) => s);
  const { mutateAsync, isSuccess, isPending, isError } =
    useCreateInteractionEvent();

  const sendRequestFn = async (): Promise<void> => {
    await mutateAsync({
      data: {
        eventType: 'early_access_request',
        metadata: {
          serviceId: service.id,
          serviceName: service.name,
          serviceDescription: service.description,
          timestamp: new Date().toISOString(),
          additionalNotes: message,
        },
      },
    });
  };

  if (isSuccess) {
    return (
      <div className="space-y-4 p-6 md:p-14">
        <H2>Your request has been sent!</H2>
        <Body1 className="mb-4 text-zinc-500">
          Your request for early access to {service.name} has been received.
          <br />
          We’ll get back to you shortly.
        </Body1>
        <div className="space-y-4 rounded-xl bg-zinc-50 p-5">
          <Body1 className="text-zinc-500">Your message</Body1>
          <Body1 className="whitespace-pre-line">
            {`Request: Early access for service "${service.name}"\n\n${
              message.length > 0 ? `Additional Notes:\n\n${message}` : ''
            }`}
          </Body1>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8 p-6 md:p-14">
        <div className="flex flex-col gap-4">
          <H2>{service.name}</H2>
          <H3>Request Early Access</H3>
          <Body1>{service.description}</Body1>
        </div>
        <Textarea
          placeholder="Tell us a little bit about your request."
          className="resize-none"
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>
      <div className="flex items-center px-6 pb-12 md:px-14">
        <Button className="w-full" onClick={sendRequestFn}>
          {isPending ? <Spinner /> : isError ? 'Error' : 'Send request'}
        </Button>
      </div>
    </>
  );
};
