import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { StatusFilterOptionType } from '@/features/biomarkers/types/filters';

interface BiomarkerFilterStore {
  selectedStatus: StatusFilterOptionType;
  selectedCategories: string[];
  updateStatus: (selectedStatus: StatusFilterOptionType) => void;
  updateCategories: (selectedCategories: string[]) => void;
  clearStatus: () => void;
  clearCategories: () => void;
}

export const useBiomarkerFilterStore = create<BiomarkerFilterStore>()(
  devtools(
    (set) => ({
      selectedStatus: 'All Ranges',
      selectedCategories: [],

      updateStatus: (selectedStatus) => set({ selectedStatus }),
      updateCategories: (selectedCategories) => set({ selectedCategories }),
      clearStatus: () => set({ selectedStatus: 'All Ranges' }),
      clearCategories: () => set({ selectedCategories: [] }),
    }),
    { name: 'BiomarkerFilterStore' },
  ),
);
