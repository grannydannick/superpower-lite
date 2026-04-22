import { useState } from 'react';

import type { AddOnItemId } from './api/add-on-panels';

export interface AddOnPanelsCartController {
  selectedServiceIds: Set<AddOnItemId>;
  hasInitializedRecommendedSelections: boolean;
  addService: (serviceId: AddOnItemId) => void;
  applyToggle: (select: AddOnItemId[], deselect: AddOnItemId[]) => void;
  markRecommendedSelectionsInitialized: () => void;
  clear: () => void;
}

export function useLocalAddOnPanelsCart() {
  const [selectedServiceIds, setSelectedServiceIds] = useState(
    () => new Set<AddOnItemId>(),
  );
  const [
    hasInitializedRecommendedSelections,
    setHasInitializedRecommendedSelections,
  ] = useState(false);

  return {
    selectedServiceIds,
    hasInitializedRecommendedSelections,
    addService: (serviceId: AddOnItemId) => {
      setSelectedServiceIds((currentIds) => {
        if (currentIds.has(serviceId)) {
          return currentIds;
        }

        const nextIds = new Set(currentIds);
        nextIds.add(serviceId);
        return nextIds;
      });
    },
    applyToggle: (select: AddOnItemId[], deselect: AddOnItemId[]) => {
      setSelectedServiceIds((currentIds) => {
        const nextIds = new Set(currentIds);

        for (const id of deselect) {
          nextIds.delete(id);
        }

        for (const id of select) {
          nextIds.add(id);
        }

        return nextIds;
      });
    },
    markRecommendedSelectionsInitialized: () => {
      setHasInitializedRecommendedSelections((currentValue) => {
        if (currentValue) {
          return currentValue;
        }

        return true;
      });
    },
    clear: () => {
      setSelectedServiceIds(new Set<AddOnItemId>());
    },
  };
}
