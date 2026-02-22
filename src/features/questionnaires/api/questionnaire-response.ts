import { useQuery, useQueryClient } from '@tanstack/react-query';

import { $api } from '@/orpc/client';
import type { operations } from '@/orpc/types.generated';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const isUuid = (value: string): boolean => UUID_RE.test(value);

// Extract types from generated operations
type GetQuestionnaireResponseByIdResponse =
  operations['questionnaireResponse.getById']['responses'][200]['content']['application/json'];

type ListQuestionnaireResponsesResponse =
  operations['questionnaireResponse.list']['responses'][200]['content']['application/json'];

type CreateQuestionnaireResponseBody =
  operations['questionnaireResponse.create']['requestBody']['content']['application/json'];

type UpdateQuestionnaireResponseBody =
  operations['questionnaireResponse.update']['requestBody']['content']['application/json'];

type QuestionnaireResponseStatus =
  | 'in-progress'
  | 'completed'
  | 'amended'
  | 'entered-in-error'
  | 'stopped';

export type {
  GetQuestionnaireResponseByIdResponse,
  ListQuestionnaireResponsesResponse,
  CreateQuestionnaireResponseBody,
  UpdateQuestionnaireResponseBody,
  QuestionnaireResponseStatus,
};

/**
 * Hook to fetch a questionnaire response by UUID
 */
export function useQuestionnaireResponseById(
  id: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    ...$api.queryOptions('get', '/questionnaire-responses/{id}', {
      params: { path: { id } },
    }),
    enabled: options?.enabled ?? !!id,
  });
}

/**
 * Hook to list questionnaire responses with filters
 */
export function useQuestionnaireResponseList(
  filters?: {
    questionnaireName?: string;
    status?: string;
    _sort?: '_lastUpdated' | '-_lastUpdated' | 'authored' | '-authored';
  },
  options?: { enabled?: boolean },
) {
  return useQuery({
    ...$api.queryOptions('get', '/questionnaire-responses', {
      params: { query: filters },
    }),
    enabled: options?.enabled ?? true,
  });
}

/**
 * Backwards-compatible hook that accepts identifier (name or UUID)
 * Uses list endpoint filtered by questionnaireName, returns first match
 */
export function useQuestionnaireResponse({
  identifier,
  statuses,
  queryConfig,
}: {
  identifier: string;
  statuses?: QuestionnaireResponseStatus[];
  queryConfig?: { enabled?: boolean };
}) {
  const identifierIsUuid = isUuid(identifier);

  // If UUID, fetch directly by ID
  const byIdQuery = useQuestionnaireResponseById(identifier, {
    enabled: (queryConfig?.enabled ?? true) && identifierIsUuid,
  });

  // If name, use list endpoint with filter
  const listQuery = useQuestionnaireResponseList(
    {
      questionnaireName: identifier,
      status: statuses?.join(','),
      _sort: '-_lastUpdated', // Get most recent first
    },
    { enabled: (queryConfig?.enabled ?? true) && !identifierIsUuid },
  );

  if (identifierIsUuid) {
    return {
      ...byIdQuery,
      data: byIdQuery.data
        ? { questionnaireResponse: byIdQuery.data }
        : undefined,
    };
  }

  return {
    ...listQuery,
    data: listQuery.data?.[0]
      ? { questionnaireResponse: listQuery.data[0] }
      : { questionnaireResponse: null },
  };
}

/**
 * Hook to create a new questionnaire response
 */
export function useCreateQuestionnaireResponse() {
  const queryClient = useQueryClient();

  const mutation = $api.useMutation('post', '/questionnaire-responses');

  return {
    ...mutation,
    mutateAsync: async (body: CreateQuestionnaireResponseBody) => {
      const result = await mutation.mutateAsync({ body });

      // Invalidate list queries
      queryClient.invalidateQueries({
        queryKey: ['get', '/questionnaire-responses'],
      });

      return result;
    },
  };
}

type UpdateVariables = {
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: { item?: any[]; status?: QuestionnaireResponseStatus };
  invalidateIdentifiers?: string[];
};

type UseUpdateQuestionnaireResponseOptions = {
  mutationConfig?: {
    onSuccess?: (data: GetQuestionnaireResponseByIdResponse) => void;
    onError?: (error: unknown) => void;
  };
};

/**
 * Hook to update an existing questionnaire response
 */
export function useUpdateQuestionnaireResponse(
  hookOptions?: UseUpdateQuestionnaireResponseOptions,
) {
  const queryClient = useQueryClient();

  const mutation = $api.useMutation('patch', '/questionnaire-responses/{id}');

  const doMutate = async (variables: UpdateVariables) => {
    const result = await mutation.mutateAsync({
      params: { path: { id: variables.id } },
      body: variables.data as UpdateQuestionnaireResponseBody,
    });

    // Invalidate the updated response
    queryClient.invalidateQueries({
      queryKey: [
        'get',
        '/questionnaire-responses/{id}',
        { params: { path: { id: variables.id } } },
      ],
    });

    // Invalidate list queries
    queryClient.invalidateQueries({
      queryKey: ['get', '/questionnaire-responses'],
    });

    // Invalidate additional identifiers if provided
    variables.invalidateIdentifiers?.forEach((id) => {
      queryClient.invalidateQueries({
        queryKey: [
          'get',
          '/questionnaire-responses/{id}',
          { params: { path: { id } } },
        ],
      });
    });

    return result;
  };

  return {
    ...mutation,
    mutate: (
      variables: UpdateVariables,
      options?: {
        onSuccess?: (data: GetQuestionnaireResponseByIdResponse) => void;
        onError?: (error: unknown) => void;
      },
    ) => {
      doMutate(variables)
        .then((result) => {
          hookOptions?.mutationConfig?.onSuccess?.(result);
          options?.onSuccess?.(result);
        })
        .catch((error) => {
          hookOptions?.mutationConfig?.onError?.(error);
          options?.onError?.(error);
        });
    },
    mutateAsync: doMutate,
  };
}

// Query options for external use
export const getQuestionnaireResponseByIdQueryOptions = (id: string) =>
  $api.queryOptions('get', '/questionnaire-responses/{id}', {
    params: { path: { id } },
  });

export const getQuestionnaireResponseListQueryOptions = (filters?: {
  questionnaireName?: string;
  status?: string;
  _sort?: '_lastUpdated' | '-_lastUpdated' | 'authored' | '-authored';
}) =>
  $api.queryOptions('get', '/questionnaire-responses', {
    params: { query: filters },
  });
