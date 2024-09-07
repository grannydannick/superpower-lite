import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
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
      <div className="flex flex-col">
        <p className="mb-4 text-3xl">Your request has been sent!</p>
        <p className="mb-8 text-[#52525B]">
          Your request for early access to {service.name} has been received.
          We’ll get back to you shortly.
        </p>
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <p className="mb-3 text-[#A1A1AA]">Your message</p>
          <p className="whitespace-pre-line">
            {`Request: Early access for service "${service.name}"\n\n${
              message.length > 0 ? `Additional Notes:\n\n${message}` : ''
            }`}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-4xl">{service.name}</h2>
      <h3 className="mt-4 text-2xl">Request Early Access</h3>
      <p className="mt-4">{service.description}</p>
      <div className="mt-8 space-y-8">
        <Textarea
          placeholder="Tell us a little bit about your request."
          className="resize-none"
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>
      <div className="mt-14 flex items-center">
        <Button className="w-full" onClick={sendRequestFn}>
          {isPending ? <Spinner /> : isError ? 'Error' : 'Send request'}
        </Button>
      </div>
    </div>
  );
};
