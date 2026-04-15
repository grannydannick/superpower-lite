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

// April 13 2026 00:00 PDT
const SINGLE_THREAD_RELEASE_DATE = new Date('2026-04-13T07:00:00Z');

export function shouldShowSingleThreadIntro() {
  return isWithinDays(SINGLE_THREAD_RELEASE_DATE, 7);
}
