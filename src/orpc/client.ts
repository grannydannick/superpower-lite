/**
 * API client for ts-server
 *
 * Two ways to use:
 *
 * 1. Direct API calls (manual):
 * ```ts
 * import { api } from '@/orpc/client';
 *
 * const { data, error } = await api.GET('/auth/methods', {
 *   params: { query: { email: 'user@example.com' } }
 * });
 * ```
 *
 * 2. React Query hooks (recommended):
 * ```ts
 * import { $api } from '@/orpc/client';
 *
 * const { data } = $api.useQuery('get', '/auth/methods', {
 *   params: { query: { email: 'user@example.com' } }
 * });
 * ```
 */
export { api, $api } from '@/orpc/superpower-api';

/**
 * Re-export types for convenience
 */
export type { paths, components } from '@/orpc/superpower-api';
