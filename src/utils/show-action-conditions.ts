import { isWithinDays } from '@/utils/get-date-time';

// month is zero-indexed:
const IMPORT_MEMORY_ROLLOUT_DATE = new Date(2026, 2, 26);

export const UPLOAD_LABS_DISMISSED_AT_STORAGE_KEY =
  'concierge:upload-labs:dismissed-at';

export const IMPORT_MEMORY_DISMISSED_AT_STORAGE_KEY =
  'concierge:import-memory:dismissed-at';

export const CONNECT_WEARABLES_DISMISSED_AT_STORAGE_KEY =
  'concierge:connect-wearables:dismissed-at';

export function shouldShowImportMemory(userCreatedAt?: string | Date) {
  if (userCreatedAt == null) return true;
  return (
    isWithinDays(userCreatedAt, 10) ||
    isWithinDays(IMPORT_MEMORY_ROLLOUT_DATE, 14)
  );
}
