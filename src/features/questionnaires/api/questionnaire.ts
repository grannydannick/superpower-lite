import { useQuery, UseQueryOptions } from '@tanstack/react-query';

import { $api } from '@/orpc/client';
import type { operations } from '@/orpc/types.generated';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const isUuid = (value: string): boolean => UUID_RE.test(value);

// Extract response types from generated operations
type GetQuestionnaireByIdResponse =
  operations['questionnaire.getById']['responses'][200]['content']['application/json'];

type ListQuestionnairesResponse =
  operations['questionnaire.getByName']['responses'][200]['content']['application/json'];

type QuestionnaireName = NonNullable<
  operations['questionnaire.getByName']['parameters']['query']
>['name'];

export type {
  GetQuestionnaireByIdResponse,
  ListQuestionnairesResponse,
  QuestionnaireName,
};

/**
 * Hook to fetch a questionnaire by its UUID
 */
export function useQuestionnaireById(
  id: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    ...$api.queryOptions('get', '/questionnaires/{id}', {
      params: { path: { id } },
    }),
    enabled: options?.enabled ?? !!id,
  });
}

/**
 * Hook to fetch questionnaires by name (returns array, typically use first result)
 * This replaces the old pattern where identifier could be name or UUID
 */
export function useQuestionnaireByName(
  name: QuestionnaireName,
  options?: { enabled?: boolean; status?: 'draft' | 'active' | 'retired' },
) {
  return useQuery({
    ...$api.queryOptions('get', '/questionnaires', {
      params: { query: { name, status: options?.status } },
    }),
    enabled: options?.enabled ?? !!name,
    select: (data) => data?.[0], // Return first matching questionnaire
  });
}

/**
 * Backwards-compatible hook that accepts either UUID or name
 * Determines type and calls appropriate endpoint
 */
export function useQuestionnaire({
  identifier,
  queryConfig,
}: {
  identifier: string;
  queryConfig?: Partial<
    UseQueryOptions<GetQuestionnaireByIdResponse | ListQuestionnairesResponse>
  >;
}) {
  const identifierIsUuid = isUuid(identifier);

  const byIdQuery = useQuestionnaireById(identifier, {
    enabled: (queryConfig?.enabled ?? true) && identifierIsUuid,
  });

  const byNameQuery = useQuestionnaireByName(identifier as QuestionnaireName, {
    enabled: (queryConfig?.enabled ?? true) && !identifierIsUuid,
  });

  if (identifierIsUuid) {
    return {
      ...byIdQuery,
      data: byIdQuery.data ? { questionnaire: byIdQuery.data } : undefined,
    };
  }

  return {
    ...byNameQuery,
    data: byNameQuery.data ? { questionnaire: byNameQuery.data } : undefined,
  };
}

// Re-export query options for external use
export const getQuestionnaireByIdQueryOptions = (id: string) =>
  $api.queryOptions('get', '/questionnaires/{id}', {
    params: { path: { id } },
  });

export const getQuestionnaireByNameQueryOptions = (
  name: QuestionnaireName,
  status?: 'draft' | 'active' | 'retired',
) =>
  $api.queryOptions('get', '/questionnaires', {
    params: { query: { name, status } },
  });
