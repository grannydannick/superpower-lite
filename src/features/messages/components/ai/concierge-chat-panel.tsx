import { useParams, useSearch } from '@tanstack/react-router';
import { type UIMessage } from 'ai';
import { useEffect, useRef, useState } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useMessages } from '@/features/messages/api/get-messages';
import { useUser } from '@/lib/auth';

import { Chat } from './chat';
import { type Preset, PRESET_MESSAGES } from './preset-messages';

interface ConciergeChatSession {
  chatId: string;
  initialMessages: UIMessage[];
}

interface DraftSessionOptions {
  chatId: string;
  preset: Preset | undefined;
  presetMessageId: string;
  userFirstName: string | undefined;
}

function getErrorStatus(error: unknown): number | null {
  if (error == null || typeof error !== 'object' || Array.isArray(error)) {
    return null;
  }

  if (!('response' in error)) {
    return null;
  }

  const response = error.response;
  if (
    response == null ||
    typeof response !== 'object' ||
    Array.isArray(response)
  ) {
    return null;
  }

  if (!('status' in response)) {
    return null;
  }

  const status = response.status;
  return typeof status === 'number' ? status : null;
}

function createDraftSession({
  chatId,
  preset,
  presetMessageId,
  userFirstName,
}: DraftSessionOptions): ConciergeChatSession {
  if (preset === undefined) {
    return { chatId, initialMessages: [] };
  }

  return {
    chatId,
    initialMessages: [
      {
        id: presetMessageId,
        role: 'assistant',
        parts: [
          {
            type: 'text',
            text: `Hi ${userFirstName ?? 'there'}!\n\n${PRESET_MESSAGES[preset]}`,
          },
        ],
      },
    ],
  };
}

export function ConciergeChatPanel() {
  const routeId = useParams({
    strict: false,
    select: (params) => {
      if (typeof params.id === 'string' && params.id.length > 0) {
        return params.id;
      }

      return undefined;
    },
  });
  const defaultMessage = useSearch({
    from: '/_app/concierge',
    select: (search) => search.defaultMessage,
  });
  const preset = useSearch({
    from: '/_app/concierge',
    select: (search) => search.preset,
  });
  const { data: user } = useUser();

  const previousRouteIdRef = useRef<string | undefined>(routeId);
  const previousPresetRef = useRef<string | undefined>(preset);
  const draftSessionRef = useRef<ConciergeChatSession | null>(null);

  if (routeId == null) {
    const enteredDraftFromPersistedRoute = previousRouteIdRef.current != null;
    const presetChanged = preset !== previousPresetRef.current;
    if (
      draftSessionRef.current == null ||
      enteredDraftFromPersistedRoute ||
      presetChanged
    ) {
      draftSessionRef.current = createDraftSession({
        chatId: crypto.randomUUID(),
        preset,
        presetMessageId: crypto.randomUUID(),
        userFirstName: user?.firstName,
      });
    }
  } else if (
    draftSessionRef.current != null &&
    draftSessionRef.current.chatId !== routeId
  ) {
    draftSessionRef.current = null;
  }

  previousRouteIdRef.current = routeId;
  previousPresetRef.current = preset;

  const draftSession = draftSessionRef.current;
  const [persistedSession, setPersistedSession] =
    useState<ConciergeChatSession | null>(null);

  const isPromotedDraftRoute =
    routeId != null && draftSession != null && draftSession.chatId === routeId;
  const shouldLoadPersistedSession =
    routeId != null &&
    !isPromotedDraftRoute &&
    persistedSession?.chatId !== routeId;

  const messagesQuery = useMessages({
    chatId: routeId ?? '',
    hideToast: true,
    queryConfig: {
      enabled: shouldLoadPersistedSession,
      retry: false,
    },
  });

  const errorStatus = getErrorStatus(messagesQuery.error);
  const canFallbackToEmptyChat =
    routeId != null &&
    errorStatus === 404 &&
    defaultMessage != null &&
    defaultMessage.length > 0;

  useEffect(() => {
    if (routeId == null) return;
    if (isPromotedDraftRoute) return;
    if (persistedSession?.chatId === routeId) return;

    if (messagesQuery.data != null) {
      setPersistedSession({
        chatId: routeId,
        initialMessages: messagesQuery.data,
      });
      return;
    }

    if (!canFallbackToEmptyChat) return;

    setPersistedSession({
      chatId: routeId,
      initialMessages: [],
    });
  }, [
    canFallbackToEmptyChat,
    isPromotedDraftRoute,
    messagesQuery.data,
    persistedSession?.chatId,
    routeId,
  ]);

  if (routeId == null) {
    if (draftSession == null) {
      return <div className="flex-1" />;
    }

    return (
      <Chat
        key={draftSession.chatId}
        id={draftSession.chatId}
        initialMessages={draftSession.initialMessages}
      />
    );
  }

  if (isPromotedDraftRoute) {
    return (
      <Chat
        key={draftSession.chatId}
        id={draftSession.chatId}
        initialMessages={draftSession.initialMessages}
      />
    );
  }

  if (persistedSession != null && persistedSession.chatId === routeId) {
    return (
      <Chat
        key={persistedSession.chatId}
        id={persistedSession.chatId}
        initialMessages={persistedSession.initialMessages}
      />
    );
  }

  if (
    messagesQuery.isError &&
    messagesQuery.data == null &&
    !canFallbackToEmptyChat
  ) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Alert className="max-w-lg">
          <AlertTitle>Unable to load this conversation</AlertTitle>
          <AlertDescription className="flex items-center justify-between gap-3">
            <span>Please try again.</span>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                void messagesQuery.refetch();
              }}
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <div className="flex-1" />;
}
