import type { FileUIPart } from 'ai';
import { create } from 'zustand';

interface ChatState {
  sessionStartTime: number | null;
  messageCount: number;
  responseTimes: number[];
  pendingFiles: FileUIPart[];
  setSessionStartTime: (time: number) => void;
  incrementMessageCount: () => void;
  addResponseTime: (time: number) => void;
  setPendingFiles: (files: FileUIPart[]) => void;
  consumePendingFiles: () => FileUIPart[];
  resetSession: () => void;
}

export const useChatStore = create<ChatState>()((set, get) => ({
  sessionStartTime: null,
  messageCount: 0,
  responseTimes: [],
  pendingFiles: [],
  setSessionStartTime: (time) => set(() => ({ sessionStartTime: time })),
  incrementMessageCount: () =>
    set((state) => ({ messageCount: state.messageCount + 1 })),
  addResponseTime: (time) =>
    set((state) => ({ responseTimes: [...state.responseTimes, time] })),
  setPendingFiles: (files) => set(() => ({ pendingFiles: files })),
  consumePendingFiles: () => {
    const files = get().pendingFiles;
    set(() => ({ pendingFiles: [] }));
    return files;
  },
  resetSession: () =>
    set(() => ({
      sessionStartTime: null,
      messageCount: 0,
      responseTimes: [],
      pendingFiles: [],
    })),
}));
