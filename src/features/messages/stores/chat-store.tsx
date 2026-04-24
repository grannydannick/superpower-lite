import type { FileUIPart } from 'ai';
import { create } from 'zustand';

interface ChatState {
  pendingFiles: FileUIPart[];
  setPendingFiles: (files: FileUIPart[]) => void;
  consumePendingFiles: () => FileUIPart[];
}

export const useChatStore = create<ChatState>()((set, get) => ({
  pendingFiles: [],
  setPendingFiles: (files) => set(() => ({ pendingFiles: files })),
  consumePendingFiles: () => {
    const files = get().pendingFiles;
    set(() => ({ pendingFiles: [] }));
    return files;
  },
}));
