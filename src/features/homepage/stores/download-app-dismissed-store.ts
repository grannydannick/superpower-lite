import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DownloadAppDismissedState {
  dismissed: boolean;
  setDismissed: (value: boolean) => void;
}

export const useDownloadAppDismissedStore = create<DownloadAppDismissedState>()(
  persist(
    (set) => ({
      dismissed: false,
      setDismissed: (value) => set({ dismissed: value }),
    }),
    { name: 'download-app-dismissed-v1' },
  ),
);
