/**
 * Superpower API Client
 *
 * Type-safe REST API client for ts-server using OpenAPI/REST protocol
 * (NOT the RPC binary protocol)
 *
 * This follows the same pattern as website-next for calling remote ts-server endpoints.
 */
import createFetchClient from 'openapi-fetch';
import createClient from 'openapi-react-query';

import { env } from '@/config/env';
import type { paths } from '@/orpc/types.generated';

/**
 * Create a type-safe fetch client for the Superpower API
 *
 * This uses the OpenAPI/REST endpoints (e.g., GET /auth/methods)
 * NOT the RPC binary protocol
 */
export const api = createFetchClient<paths>({
  baseUrl: `${env.API_URL}/rpc`,
  // We don't need to do anything with headers because we have cookie-based auth.
  credentials: 'include',
});

/**
 * React Query utilities for the API
 *
 * This provides TanStack Query integration similar to @orpc/tanstack-query
 * but for REST/OpenAPI via openapi-fetch.
 *
 * Usage:
 * ```ts
 * const { data } = $api.useQuery('get', '/auth/methods', {
 *   params: { query: { email: 'user@example.com' } }
 * });
 * ```
 */
export const $api = createClient(api);

/**
 * Re-export types for convenience
 */
export type { paths } from '@/orpc/types.generated';
export type { components } from '@/orpc/types.generated';
