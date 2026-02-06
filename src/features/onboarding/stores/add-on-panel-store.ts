import { create } from 'zustand';

interface AddOnPanelStoreState {
  selectedPanelIds: Set<string>;
  togglePanel: (panelId: string) => void;
  clear: () => void;
}

export const useAddOnPanelStore = create<AddOnPanelStoreState>()((set) => ({
  selectedPanelIds: new Set(),
  togglePanel: (panelId) =>
    set((state) => ({
      selectedPanelIds: state.selectedPanelIds.has(panelId)
        ? new Set(
            Array.from(state.selectedPanelIds).filter((id) => id !== panelId),
          )
        : new Set([...Array.from(state.selectedPanelIds), panelId]),
    })),
  clear: () => set(() => ({ selectedPanelIds: new Set() })),
}));
