import { STATUS_OPTIONS } from '@/features/biomarkers/const/status-options';
import { StatusFilterOptionType } from '@/features/biomarkers/types/filters';

export const getCurrentStatus = (status: StatusFilterOptionType) => {
  switch (status) {
    case 'All Ranges':
      return STATUS_OPTIONS.ALL_RANGES;
    case 'Normal':
      return STATUS_OPTIONS.NORMAL;
    case 'Optimal':
      return STATUS_OPTIONS.OPTIMAL;
    case 'Out of Range':
      return STATUS_OPTIONS.OUT_OF_RANGE;
  }
};
