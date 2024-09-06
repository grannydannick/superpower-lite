import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { useCreateMessage } from '@/features/messages/api/create-message';
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
      },
    });
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col">
        <p className="mb-4 text-3xl">Your message has been sent!</p>
        <p className="mb-8 text-[#52525B]">
          Your longevity physician has received your message. We’ve started a
          conversation via SMS.
        </p>
        <div className="rounded-xl bg-[#F7F7F7] p-5">
          <p className="mb-3 text-[#A1A1AA]">Your message</p>
          <p className="whitespace-pre-line">{`Request: ${
            service.name
          }\n\nYour concierge longevity clinician will respond with details about this service.${
            message.length > 0 ? `\n\nAdditional Notes:\n\n${message}` : ''
          }`}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <p className="mb-4 text-3xl">Message your concierge</p>
      <p className="mb-8 text-[#52525B]">
        Your longevity clinican will receive your request. We’ll start a
        conversation in your SMS regarding your interest in this service.
      </p>
      <Textarea
        placeholder="Add any additional notes about your request."
        onChange={(e) => {
          setMessage(e.target.value);
        }}
      />
      <div className="mt-14 flex items-center">
        <Button className="w-full" onClick={sendNoteFn}>
          {isPending ? <Spinner /> : isError ? 'Error' : 'Send request'}
        </Button>
      </div>
    </div>
  );
};
