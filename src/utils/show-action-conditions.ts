import { isWithinDays } from '@/utils/get-date-time';

// month is zero-indexed:
const IMPORT_MEMORY_ROLLOUT_DATE = new Date(2026, 2, 26);

export function shouldShowImportMemory(userCreatedAt?: string | Date) {
  if (userCreatedAt == null) return true;
  return (
    isWithinDays(userCreatedAt, 10) ||
    isWithinDays(IMPORT_MEMORY_ROLLOUT_DATE, 14)
  );
}
