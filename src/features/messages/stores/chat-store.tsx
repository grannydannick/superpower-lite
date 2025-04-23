import { create } from 'zustand';

type ChatType = 'ai' | 'concierge';

interface ChatState {
  type: ChatType;
  update: (type: ChatType) => void;
}

export const useChatStore = create<ChatState>()((set) => ({
  type: 'ai',
  update: (type) => set(() => ({ type })),
}));
