import { createFileRoute } from '@tanstack/react-router';
import { UIMessage } from 'ai';
import { useState } from 'react';

import { Chat } from '@/features/messages/components/ai/chat';
import { useUser } from '@/lib/auth';

export const Route = createFileRoute('/_app/concierge/')({
  component: ConciergeIndexComponent,
});

function ConciergeIndexComponent() {
  const [generatedUUID] = useState(() => crypto.randomUUID());
  const [presetMessageId] = useState(() => crypto.randomUUID());
  const preset = Route.useSearch({ select: (s) => s.preset });
  const { data: user } = useUser();

  let initialMessages: Array<UIMessage> = [];

  if (preset === 'update-personalization') {
    const text = `Hi ${user?.firstName ?? 'there'}, what would you like to update about your medical history? This could be things like a new therapy, updated diet, new habits or anything else you would like us to remember about you.`;
    initialMessages = [
      {
        id: presetMessageId,
        role: 'assistant',
        parts: [{ type: 'text', text }],
      },
    ];
  }

  return (
    <Chat
      key={generatedUUID}
      id={generatedUUID}
      initialMessages={initialMessages}
    />
  );
}
