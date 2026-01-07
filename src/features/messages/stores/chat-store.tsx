import { create } from 'zustand';

interface ChatState {
  sessionStartTime: number | null;
  messageCount: number;
  responseTimes: number[];
  setSessionStartTime: (time: number) => void;
  incrementMessageCount: () => void;
  addResponseTime: (time: number) => void;
  resetSession: () => void;
}

export const useChatStore = create<ChatState>()((set) => ({
  sessionStartTime: null,
  messageCount: 0,
  responseTimes: [],
  setSessionStartTime: (time) => set(() => ({ sessionStartTime: time })),
  incrementMessageCount: () =>
    set((state) => ({ messageCount: state.messageCount + 1 })),
  addResponseTime: (time) =>
    set((state) => ({ responseTimes: [...state.responseTimes, time] })),
  resetSession: () =>
    set(() => ({ sessionStartTime: null, messageCount: 0, responseTimes: [] })),
}));
