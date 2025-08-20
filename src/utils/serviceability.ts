import { CollectionMethodType } from '@/types/api';
const AT_HOME_ONLY_STATES = new Set<string>(['NY', 'NJ', 'AZ']);
export function getCollectionMethodForState(
  state?: string,
): CollectionMethodType {
  if (state && AT_HOME_ONLY_STATES.has(state)) return 'AT_HOME';
  return 'IN_LAB';
}
