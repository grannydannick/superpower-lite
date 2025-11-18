import { FileUIPart, UIMessage } from 'ai';
import { useState } from 'react';
import { useParams } from 'react-router-dom';

import { useMessages } from '@/features/messages/api/get-messages';
import { Chat } from '@/features/messages/components/ai/chat';
import { ChatMessage } from '@/types/api';
import { generateUUID } from '@/utils/generate-uiud';

export const ConciergeRoute = () => {
  // ensure stable ID for the session while there's no :id in the URL
  const [generatedUUID] = useState(() => generateUUID());
  const { id } = useParams();

  const getMessagesQuery = useMessages({
    chatId: id as string,
    queryConfig: {
      enabled: !!id,
    },
  });

  function convertToUIMessages(messages: Array<ChatMessage>): Array<UIMessage> {
    return messages.map(
      (message) =>
        ({
          id: message.id,
          parts: message.parts.map((part) => {
            if (part.type === 'file') {
              return {
                type: 'file' as const,
                url: part.url,
                filename: part.name,
                mediaType: part.mediaType,
              } satisfies FileUIPart;
            }
            return part;
          }),
          role: message.role,
        }) satisfies UIMessage,
    );
  }

  if (getMessagesQuery.isLoading) {
    return <></>;
  }

  return (
    <Chat
      key={id ?? generatedUUID}
      id={id ?? generatedUUID}
      initialMessages={
        getMessagesQuery.data ? convertToUIMessages(getMessagesQuery.data) : []
      }
    />
  );
};
