import { useChat } from '@ai-sdk/react';
import { useQueryClient } from '@tanstack/react-query';
import { DefaultChatTransport, FileUIPart } from 'ai';
import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { env } from '@/config/env';
import { useCreateFollowups } from '@/features/messages/api/create-followups';
import { useHistory } from '@/features/messages/api/get-history';
import { MultimodalInput } from '@/features/messages/components/ai/multimodal-input';
import { AssistantMessages } from '@/features/messages/components/assistant/assistant-messages';
import { useAssistantStore } from '@/features/messages/stores/assistant-store';
import { useAnalytics } from '@/hooks/use-analytics';
import { cn, getActiveLogin } from '@/lib/utils';
import { generateUUID } from '@/utils/generate-uiud';

import { ChatSuggestion } from '../chat-suggestion';

export function AssistantChat({
  chatId,
  isActive = false,
  isResizing = false,
}: {
  chatId: string;
  isActive: boolean;
  isResizing?: boolean;
}) {
  const { refetch } = useHistory();
  const { track } = useAnalytics();
  const { pathname } = useLocation();
  const queryClient = useQueryClient();

  const [id] = useState<string>(chatId);

  const [lastSentMessageTime, setLastSentMessageTime] = useState<number | null>(
    null,
  );
  // input is handled by custom store to avoid additional effects to sync preset inputs
  const input = useAssistantStore((s) => s.input);
  const setInput = useAssistantStore((s) => s.setInput);
  const [attachments, setAttachments] = useState<Array<FileUIPart>>([]);

  const [shouldGenerateFollowups, setShouldGenerateFollowups] = useState(false);

  const transportHeaders: Record<string, string> = {
    Accept: 'application/json',
  };
  const accessToken = getActiveLogin()?.accessToken;
  if (accessToken) {
    transportHeaders.Authorization = `Bearer ${accessToken}`;
  }

  const { messages, setMessages, sendMessage, status, stop } = useChat({
    id,
    transport: new DefaultChatTransport({
      api: `${env.API_URL}/chat`,
      headers: () => {
        const activeLogin = getActiveLogin();
        const accessToken = activeLogin?.accessToken;

        return {
          Accept: 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        };
      },
      prepareSendMessagesRequest({ messages, id }) {
        const hasUserMessage = messages.some((m) => m.role === 'user');
        return {
          body: {
            message: messages[messages.length - 1],
            id: hasUserMessage ? id : null,
            _followup: false,
          },
          credentials: 'include',
        };
      },
    }),
    messages: [],
    experimental_throttle: 100,
    generateId: generateUUID,
    onFinish: ({ message }) => {
      refetch();

      if (message.role === 'user') {
        const currentTime = Date.now();
        setLastSentMessageTime(currentTime);

        const messageLength = message.parts?.reduce((acc, part) => {
          if (part.type === 'text') acc += part.text.length;
          return acc;
        }, 0);

        track('sent_message_ai', {
          message_length: messageLength ?? 0,
        });
      } else if (message.role === 'assistant') {
        const responseTime = lastSentMessageTime
          ? Date.now() - lastSentMessageTime
          : null;

        track('received_message_ai', {
          response_time: responseTime,
        });

        const assistantText = (message.parts || [])
          .map((p) => (p.type === 'text' ? p.text : ''))
          .join('')
          .trim();
        if (assistantText.length > 0) {
          setShouldGenerateFollowups(true);
        }
      }
    },
  });

  const followupsContext = `I'm currently visiting ${pathname} in the Superpower app, please give me some suggestions based on this.`;

  const wantsInitialFollowups = isActive && messages.length === 0;

  const lastIsAssistant = messages[messages.length - 1]?.role === 'assistant';

  const assistantContext = useMemo(() => {
    if (!lastIsAssistant) return '';

    const m = messages[messages.length - 1];
    return (m.parts || [])
      .map((p) => (p.type === 'text' ? p.text : ''))
      .join('')
      .trim();
  }, [messages, lastIsAssistant]);

  const wantsAssistantFollowups = Boolean(
    isActive && shouldGenerateFollowups && lastIsAssistant && assistantContext,
  );

  let followupsQueryContext: string | null = null;

  if (wantsInitialFollowups) {
    followupsQueryContext = followupsContext;
  } else if (wantsAssistantFollowups) {
    followupsQueryContext = assistantContext;
  }

  const { data: followupsData = [] } = useCreateFollowups({
    context: followupsQueryContext ?? '',
    count: 3,
    enabled: Boolean(followupsQueryContext),
  });

  const showInitialSuggestions = messages.length === 0;
  const showAssistantSuggestions = messages.length !== 0 && lastIsAssistant;
  const shouldShowSuggestions =
    showInitialSuggestions || showAssistantSuggestions;

  const visibleSuggestions = shouldShowSuggestions ? followupsData : [];

  return (
    <div
      className={cn('flex h-full w-full flex-col justify-end overflow-hidden')}
    >
      <div className="mx-auto flex min-h-0 w-full min-w-0 max-w-3xl flex-1 flex-col pr-1">
        <AssistantMessages
          chatId={id}
          messages={messages}
          setMessages={setMessages}
          status={status}
          disableLayoutAnimation={isResizing}
        />
      </div>
      {visibleSuggestions.length > 0 && (
        <div className="mb-2 ml-auto flex w-full items-end gap-2 px-1">
          {visibleSuggestions.map((suggestion) => (
            <ChatSuggestion
              key={suggestion}
              onClick={() => setInput(suggestion)}
              suggestion={suggestion}
            />
          ))}
        </div>
      )}
      <div className="pt-2">
        <form
          className={cn(
            'mx-auto flex w-full flex-col gap-6 pb-2',
            messages.length > 0 ? 'mt-auto' : null,
          )}
        >
          <MultimodalInput
            chatId={id}
            input={input}
            setInput={setInput}
            sendMessage={(message, options) => {
              setInput('');
              if (assistantContext) {
                queryClient.cancelQueries({
                  queryKey: ['followups', assistantContext, 3],
                });
              }
              if (messages.length === 0) {
                queryClient.cancelQueries({
                  queryKey: ['followups', followupsContext, 3],
                });
              }
              setShouldGenerateFollowups(false);
              return sendMessage(message, options);
            }}
            status={status}
            stop={stop}
            attachments={attachments}
            setAttachments={setAttachments}
            messages={messages}
            setMessages={setMessages}
            showSuggestions={false}
            className="min-h-12 rounded-xl bg-zinc-100 shadow-none"
          />
        </form>
      </div>
    </div>
  );
}
