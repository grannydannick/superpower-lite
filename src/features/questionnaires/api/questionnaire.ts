import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { $api } from '@/orpc/client';
import type { operations } from '@/orpc/types.generated';

// UUID validation using Zod (matches server-side validation)
const uuidSchema = z.string().uuid();
const isUuid = (value: string): boolean => uuidSchema.safeParse(value).success;

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
  queryConfig?: {
    enabled?: boolean;
    placeholderData?: typeof keepPreviousData;
  };
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
