import { useChat } from '@ai-sdk/react';
import { DataUIPart, DefaultChatTransport } from 'ai';
import { useEffect, useRef, useState } from 'react';
import { z } from 'zod';

import { env } from '@/config/env';
import { getFollowupString } from '@/features/messages/utils/data-parts';
import { getActiveLogin } from '@/lib/utils';

export function useSuggestions({
  enabled,
  max = 3,
  context,
}: {
  enabled: boolean;
  max: number;
  context?: string;
}) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const startedRef = useRef(false);
  const countRef = useRef(0);

  const updateSuggestions = (entries: string | string[]) => {
    const items = Array.isArray(entries) ? entries : [entries];
    setSuggestions((prev) => {
      const next = [...new Set([...prev, ...items])].slice(0, max);
      countRef.current = next.length;
      return next;
    });
  };

  const clearSuggestions = () => {
    countRef.current = 0;
    setSuggestions([]);
  };

  const { sendMessage, stop, status } = useChat({
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
      prepareSendMessagesRequest({ messages }) {
        return {
          body: {
            message: messages[messages.length - 1],
            id: null,
          },
        };
      },
    }),
    dataPartSchemas: { followup: z.string() },
    messages: [],
    onData: (part: DataUIPart<Record<string, unknown>>) => {
      const s = getFollowupString(part);
      if (s) {
        updateSuggestions(s);
        if (countRef.current >= max) stop();
      }
    },
  });

  useEffect(() => {
    if (!enabled) return;
    if (suggestions.length > 0) return;
    if (startedRef.current) return;
    startedRef.current = true;

    // seed user message (optional context)
    sendMessage({
      role: 'user',
      parts: [
        {
          type: 'text',
          text: context ?? '',
        },
      ],
    });

    return () => {
      stop();
      startedRef.current = false;
    };
  }, [enabled, max, sendMessage, stop, context]);

  const isLoading = status === 'submitted' || status === 'streaming';

  return { suggestions, updateSuggestions, clearSuggestions, isLoading };
}
