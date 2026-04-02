import { type UseChatHelpers, useChat } from '@ai-sdk/react';
import { useQueryClient } from '@tanstack/react-query';
import { useLocation } from '@tanstack/react-router';
import { type ChatRequestOptions, type UIMessage, FileUIPart } from 'ai';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useCreateFollowups } from '@/features/messages/api/create-followups';
import { getHistoryQueryOptions } from '@/features/messages/api/get-history';
import { MultimodalInput } from '@/features/messages/components/ai/multimodal-input';
import { QueuedMessages } from '@/features/messages/components/ai/queued-messages';
import { AssistantMessages } from '@/features/messages/components/assistant/assistant-messages';
import { useMessageQueue } from '@/features/messages/hooks/use-message-queue';
import { useAssistantStore } from '@/features/messages/stores/assistant-store';
import { createChatV2Transport } from '@/features/messages/utils/chatv2-transport';
import { extractTiming } from '@/features/messages/utils/extract-timing';
import { useAnalytics } from '@/hooks/use-analytics';
import { cn } from '@/lib/utils';

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
  const { track } = useAnalytics();
  const { pathname } = useLocation();
  const queryClient = useQueryClient();

  const id = chatId;

  // input is handled by custom store to avoid additional effects to sync preset inputs
  const input = useAssistantStore((s) => s.input);
  const setInput = useAssistantStore((s) => s.setInput);
  const registerSendMessage = useAssistantStore((s) => s.registerSendMessage);
  const initialMessages = useAssistantStore((s) => s.initialMessages);
  const clearInitialMessages = useAssistantStore((s) => s.clearInitialMessages);
  const hasSetInitialMessages = useAssistantStore(
    (s) => s.hasSetInitialMessages,
  );
  const setHasSetInitialMessages = useAssistantStore(
    (s) => s.setHasSetInitialMessages,
  );
  const [attachments, setAttachments] = useState<Array<FileUIPart>>([]);

  const [shouldGenerateFollowups, setShouldGenerateFollowups] = useState(false);

  const transport = useMemo(() => createChatV2Transport<UIMessage>(), []);

  const { messages, setMessages, sendMessage, resumeStream, stop, status } =
    useChat({
      id,
      transport,
      messages: [],
      generateId: () => crypto.randomUUID(),
      onFinish: ({ message, isAbort, isDisconnect, isError }) => {
        if (isAbort) return;

        void queryClient.invalidateQueries({
          queryKey: getHistoryQueryOptions().queryKey,
        });

        if (isDisconnect || isError) return;
        if (message.role !== 'assistant') return;

        const timing = extractTiming(message, false);
        track('received_message_ai', {
          response_time: timing.totalMs,
        });

        const assistantText = (message.parts || [])
          .map((p) => (p.type === 'text' ? p.text : ''))
          .join('')
          .trim();
        if (assistantText.length > 0) {
          setShouldGenerateFollowups(true);
        }
      },
    });

  useEffect(() => {
    if (!isActive) return;

    const timeoutId = window.setTimeout(() => {
      void resumeStream().catch((err) => {
        console.debug('resumeStream failed', err);
      });
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isActive, resumeStream]);

  useEffect(() => {
    return () => {
      void stop().catch((err) => {
        console.debug('chat stop failed', err);
      });
    };
  }, [stop]);

  // Set initial messages when they're available and haven't been set yet
  useEffect(() => {
    if (initialMessages.length > 0 && !hasSetInitialMessages) {
      setMessages(initialMessages);
      setHasSetInitialMessages(true);
    }
  }, [
    initialMessages,
    hasSetInitialMessages,
    setMessages,
    setHasSetInitialMessages,
  ]);

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

  const onQueueSend = useCallback(
    (msg: { text: string; files: FileUIPart[] }) => {
      track('sent_message_ai', { message_length: msg.text.length });
      setShouldGenerateFollowups(false);
      sendMessage({ text: msg.text, files: msg.files });
    },
    [sendMessage, track],
  );

  const {
    queue,
    enqueue,
    remove: removeFromQueue,
  } = useMessageQueue({
    status,
    onSend: onQueueSend,
  });

  const visibleSuggestions =
    shouldShowSuggestions && queue.length === 0 ? followupsData : [];

  const handleSendMessage = useCallback(
    (
      message: Parameters<UseChatHelpers<UIMessage>['sendMessage']>[0],
      options?: ChatRequestOptions,
    ) => {
      setInput('');
      let messageLength = 0;
      let messageText = '';
      if (message !== undefined) {
        if ('text' in message && typeof message.text === 'string') {
          messageLength = message.text.length;
          messageText = message.text;
        } else if ('parts' in message && Array.isArray(message.parts)) {
          for (const part of message.parts) {
            if (part.type === 'text') {
              messageLength += part.text.length;
              messageText += part.text;
            }
          }
        }
      }
      if (hasSetInitialMessages) {
        clearInitialMessages();
        setHasSetInitialMessages(false);
      }
      if (assistantContext) {
        void queryClient.cancelQueries({
          queryKey: ['followups', assistantContext, 3],
        });
      }
      if (messages.length === 0) {
        void queryClient.cancelQueries({
          queryKey: ['followups', followupsContext, 3],
        });
      }
      setShouldGenerateFollowups(false);

      if (status === 'ready' || status === 'error') {
        track('sent_message_ai', {
          message_length: messageLength,
        });
        return sendMessage(message, options);
      }

      const msg = message as { text?: string; files?: FileUIPart[] };
      enqueue({ text: msg.text ?? messageText, files: msg.files ?? [] });
      return Promise.resolve();
    },
    [
      setInput,
      hasSetInitialMessages,
      clearInitialMessages,
      setHasSetInitialMessages,
      assistantContext,
      queryClient,
      messages.length,
      followupsContext,
      sendMessage,
      enqueue,
      status,
      track,
    ],
  );

  // Register sendMessage so the store can dispatch sends directly
  useEffect(() => {
    registerSendMessage(handleSendMessage);
  }, [handleSendMessage, registerSendMessage]);

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
              onClick={() =>
                void handleSendMessage({ text: suggestion, files: [] })
              }
              suggestion={suggestion}
            />
          ))}
        </div>
      )}
      <div className="pt-2">
        <QueuedMessages queue={queue} onRemove={removeFromQueue} />
        <form
          className={cn(
            'mx-auto flex w-full flex-col gap-6 pb-2',
            messages.length > 0 ? 'mt-auto' : null,
          )}
        >
          <MultimodalInput
            input={input}
            setInput={setInput}
            sendMessage={handleSendMessage}
            status={status}
            attachments={attachments}
            setAttachments={setAttachments}
            showSuggestions={false}
            className="min-h-12 rounded-xl bg-zinc-100 shadow-none"
          />
        </form>
      </div>
    </div>
  );
}
