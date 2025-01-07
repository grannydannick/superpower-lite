import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { Body1, H2 } from '@/components/ui/typography';
import { useCreateMessage } from '@/features/messages/api';
import { useOrder } from '@/features/orders/stores/order-store';

export const MessageConcierge = () => {
  const { service } = useOrder((s) => s);
  const { mutateAsync, isSuccess, isPending, isError } = useCreateMessage();
  const [message, setMessage] = useState('');

  const sendNoteFn = async (): Promise<void> => {
    await mutateAsync({
      data: {
        text: message,
        type: 'service',
        serviceName: service.name,
      },
    });
  };

  if (isSuccess) {
    return (
      <div className="space-y-4 p-6 md:p-14">
        <H2>Your message has been sent!</H2>
        <Body1 className="mb-4 text-zinc-500">
          Your longevity physician has received your message. We’ve started a
          conversation via SMS.
        </Body1>
        <div className="space-y-4 rounded-xl bg-zinc-50 p-5">
          <Body1 className="text-zinc-500">Your message</Body1>
          <Body1 className="whitespace-pre-line">{`Request: ${
            service.name
          }\n\nYour concierge longevity advisor will respond with details about this service.${
            message.length > 0 ? `\n\nAdditional Notes:\n\n${message}` : ''
          }`}</Body1>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-6 md:p-14">
        <H2>Message your concierge</H2>
        <Body1 className="mb-8 text-zinc-500">
          Your longevity clinican will receive your request. We’ll start a
          conversation in your SMS regarding your interest in this service.
        </Body1>
        <Textarea
          placeholder="Add any additional notes about your request."
          onChange={(e) => {
            setMessage(e.target.value);
          }}
        />
      </div>
      <div className="flex items-center px-6 pb-12 md:px-14">
        <Button className="w-full" onClick={sendNoteFn}>
          {isPending ? <Spinner /> : isError ? 'Error' : 'Send request'}
        </Button>
      </div>
    </>
  );
};
