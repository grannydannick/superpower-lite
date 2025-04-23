import { Attachment, UIMessage } from 'ai';
import { useParams } from 'react-router-dom';

import { useMessages } from '@/features/messages/api/get-messages';
import { Chat } from '@/features/messages/components/ai/chat';
import { ChatMessage } from '@/types/api';
import { generateUUID } from '@/utils/generate-uiud';

export const ConciergeRoute = () => {
  const generatedUUID = generateUUID();
  const { id } = useParams();
  const getMessagesQuery = useMessages({
    chatId: id as string,
    queryConfig: {
      enabled: !!id,
    },
  });

  function convertToUIMessages(messages: Array<ChatMessage>): Array<UIMessage> {
    return messages.map((message) => ({
      id: message.id,
      parts: message.parts as UIMessage['parts'],
      role: message.role as UIMessage['role'],
      // Note: content will soon be deprecated in @ai-sdk/react
      content: '',
      createdAt: message.createdAt,
      experimental_attachments:
        (message.attachments as Array<Attachment>) ?? [],
    }));
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
