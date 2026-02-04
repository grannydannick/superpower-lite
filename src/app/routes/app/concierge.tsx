import { UIMessage } from 'ai';
import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

import { useMessages } from '@/features/messages/api/get-messages';
import { Chat } from '@/features/messages/components/ai/chat';
import { useUser } from '@/lib/auth';
import { generateUUID } from '@/utils/generate-uiud';

export const ConciergeRoute = () => {
  // ensure stable ID for the session while there's no :id in the URL
  const [generatedUUID] = useState(() => generateUUID());
  // stable ID for preset messages to prevent regeneration on re-renders
  const [presetMessageId] = useState(() => generateUUID());
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { data: user } = useUser();

  const getMessagesQuery = useMessages({
    chatId: id as string,
    queryConfig: {
      enabled: !!id,
    },
  });

  // Only show loading on initial fetch, not during background refetch
  // This prevents strobe/flash when query is invalidated after memory updates
  if (getMessagesQuery.isFetching && !getMessagesQuery.data) {
    // We need this div in the loading to prevent layout shifts to the right
    return <div className="w-full" />;
  }

  const preset = searchParams.get('preset');

  let initialMessages: Array<UIMessage> = [];

  if (getMessagesQuery.data) {
    initialMessages = getMessagesQuery.data;
  }

  if (!id && preset === 'update-personalization') {
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
      key={id ?? generatedUUID}
      id={id ?? generatedUUID}
      initialMessages={initialMessages}
    />
  );
};
