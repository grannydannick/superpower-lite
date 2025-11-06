import { useMemo } from 'react';

import { useAddOnPanelStore } from '@/features/onboarding/stores/add-on-panel-store';

type UseAddOnPanelsReturn = {
  selectedIds: Set<string>;
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  togglePanel: (panelId: string) => void;
  clear: () => void;
};

export const useAddOnPanels = (): UseAddOnPanelsReturn => {
  const { selectedPanelIds, togglePanel, clear } = useAddOnPanelStore((s) => ({
    selectedPanelIds: s.selectedPanelIds,
    togglePanel: s.togglePanel,
    clear: s.clear,
  }));

  const selectedIds = useMemo(
    () => new Set(selectedPanelIds),
    [selectedPanelIds],
  );

  const setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>> = (
    action,
  ) => {
    if (typeof action === 'function') {
      const newSet = action(new Set(selectedPanelIds));
      useAddOnPanelStore.setState({
        selectedPanelIds: Array.from(newSet),
      });
    } else {
      useAddOnPanelStore.setState({
        selectedPanelIds: Array.from(action),
      });
    }
  };

  return {
    selectedIds,
    setSelectedIds,
    togglePanel,
    clear,
  };
};
