import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { Biomarker } from '@/types/api';

interface BiomarkerFilterStore {
  selectedStatuses: string[];
  selectedCategories: string[];
  biomarkers: Biomarker[];
  filteredBiomarkers: Biomarker[];
  setStatuses: (statuses: string[]) => void;
  setCategories: (categories: string[]) => void;
  clearStatuses: () => void;
  clearCategories: () => void;
  setBiomarkers: (biomarkers: Biomarker[]) => void;
  applyFilters: () => void;
}

export const useBiomarkerFilterStore = create<BiomarkerFilterStore>()(
  devtools(
    (set, get) => ({
      selectedStatuses: [],
      selectedCategories: [],
      biomarkers: [],
      filteredBiomarkers: [],

      setStatuses: (statuses) => {
        const normalizedStatuses = statuses.map((status) =>
          status.toLowerCase(),
        );
        set({ selectedStatuses: normalizedStatuses });
        get().applyFilters();
      },

      setCategories: (categories) => {
        const normalizedCategories = categories.map((category) =>
          category.toLowerCase(),
        );
        set({ selectedCategories: normalizedCategories });
        get().applyFilters();
      },

      clearStatuses: () => {
        set({ selectedStatuses: [] });
        get().applyFilters();
      },

      clearCategories: () => {
        set({ selectedCategories: [] });
        get().applyFilters();
      },

      setBiomarkers: (biomarkers) => {
        set({ biomarkers });
        get().applyFilters();
      },

      applyFilters: () => {
        const { selectedStatuses, selectedCategories, biomarkers } = get();

        const showAllStatuses =
          selectedStatuses.length === 0 || selectedStatuses.includes('');
        const showAllCategories = selectedCategories.length === 0;

        const filtered = biomarkers.filter((biomarker) => {
          const normalizedBiomarkerStatus = biomarker.status.toLowerCase();
          const normalizedBiomarkerCategory = biomarker.category.toLowerCase();

          const outOfRangeSelected = selectedStatuses.includes('high low');
          const isOutOfRange =
            normalizedBiomarkerStatus === 'high' ||
            normalizedBiomarkerStatus === 'low';

          const matchesStatus =
            showAllStatuses ||
            (outOfRangeSelected
              ? isOutOfRange
              : selectedStatuses.includes(normalizedBiomarkerStatus));

          const matchesCategory =
            showAllCategories ||
            selectedCategories.includes(normalizedBiomarkerCategory);

          return matchesStatus && matchesCategory;
        });

        set({ filteredBiomarkers: filtered });
      },
    }),
    { name: 'BiomarkerFilterStore' },
  ),
);
