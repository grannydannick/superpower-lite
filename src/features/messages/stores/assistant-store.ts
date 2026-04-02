import type { FileUIPart, UIMessage } from 'ai';
import type { SetStateAction } from 'react';
import { create } from 'zustand';

type SendMessageFn = (message: { text: string; files: FileUIPart[] }) => void;

interface AssistantState {
  isExpanded: boolean;
  input: string;
  initialMessages: UIMessage[];
  hasSetInitialMessages: boolean;
  /** Registered by AssistantChat so callers can send messages directly */
  _sendMessage: SendMessageFn | null;
  registerSendMessage: (fn: SendMessageFn) => void;
  open: (
    input?: string,
    options?: { autoSend?: boolean; files?: FileUIPart[] },
  ) => void;
  openWithMessages: (initialMessages: UIMessage[]) => void;
  close: () => void;
  toggle: (input?: string) => void;
  setInput: (value: SetStateAction<string>) => void;
  clearInput: () => void;
  clearInitialMessages: () => void;
  setHasSetInitialMessages: (value: boolean) => void;
}

export const useAssistantStore = create<AssistantState>()((set, get) => ({
  isExpanded: false,
  input: '',
  initialMessages: [],
  hasSetInitialMessages: false,
  _sendMessage: null,
  registerSendMessage: (fn) => set({ _sendMessage: fn }),
  open: (input, options) => {
    const autoSend = options?.autoSend ?? true;
    const files = options?.files ?? [];

    set((s) => ({
      isExpanded: true,
      input: typeof input === 'string' ? input : s.input,
    }));

    if (autoSend && typeof input === 'string') {
      // Defer so the store update (isExpanded) is processed first
      queueMicrotask(() => {
        const { _sendMessage } = get();
        if (_sendMessage) {
          _sendMessage({ text: input, files });
          set({ input: '' });
        }
      });
    }
  },
  openWithMessages: (initialMessages) =>
    set(() => ({
      isExpanded: true,
      initialMessages,
      input: '',
      hasSetInitialMessages: false,
    })),
  close: () =>
    set(() => ({
      isExpanded: false,
      hasSetInitialMessages: false,
      initialMessages: [],
    })),
  toggle: (input) =>
    set((s) => ({
      isExpanded: !s.isExpanded,
      input: typeof input === 'string' ? input : s.input,
    })),
  setInput: (value) =>
    set((s) => ({
      input: typeof value === 'function' ? value(s.input) : value,
    })),
  clearInput: () => set(() => ({ input: '' })),
  clearInitialMessages: () => set(() => ({ initialMessages: [] })),
  setHasSetInitialMessages: (value) =>
    set(() => ({ hasSetInitialMessages: value })),
}));
