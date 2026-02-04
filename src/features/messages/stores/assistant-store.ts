import type { UIMessage } from 'ai';
import type { SetStateAction } from 'react';
import { create } from 'zustand';

interface AssistantState {
  isExpanded: boolean;
  input: string;
  initialMessages: UIMessage[];
  hasSetInitialMessages: boolean;
  open: (input?: string) => void;
  openWithMessages: (initialMessages: UIMessage[]) => void;
  close: () => void;
  toggle: (input?: string) => void;
  setInput: (value: SetStateAction<string>) => void;
  clearInput: () => void;
  clearInitialMessages: () => void;
  setHasSetInitialMessages: (value: boolean) => void;
}

export const useAssistantStore = create<AssistantState>()((set) => ({
  isExpanded: false,
  input: '',
  initialMessages: [],
  hasSetInitialMessages: false,
  open: (input) =>
    set((s) => ({
      isExpanded: true,
      input: typeof input === 'string' ? input : s.input,
    })),
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
