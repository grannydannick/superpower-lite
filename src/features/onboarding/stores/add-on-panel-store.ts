import { create } from 'zustand';

interface AddOnPanelStoreState {
  selectedPanelIds: string[];
  togglePanel: (panelId: string) => void;
  clear: () => void;
}

export const useAddOnPanelStore = create<AddOnPanelStoreState>()((set) => ({
  selectedPanelIds: [],
  togglePanel: (panelId) =>
    set((state) => ({
      selectedPanelIds: state.selectedPanelIds.includes(panelId)
        ? state.selectedPanelIds.filter((id) => id !== panelId)
        : [...state.selectedPanelIds, panelId],
    })),
  clear: () => set(() => ({ selectedPanelIds: [] })),
}));
