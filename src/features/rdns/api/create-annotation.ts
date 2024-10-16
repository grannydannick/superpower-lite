import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { getUpcomingCallsQueryOptions } from '@/features/rdns/api/get-upcoming-calls';
import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { Annotation } from '@/types/api';

export const createAnnotationSchema = z.object({
  text: z.string().min(1),
  authorId: z.string().min(1),
  userId: z.string().min(1),
});

export type CreateAnnotationInput = z.infer<typeof createAnnotationSchema>;

export const createAnnotation = ({
  data,
  serviceRequestId,
}: {
  data: CreateAnnotationInput;
  serviceRequestId: string;
}): Promise<{ annotation: Annotation }> => {
  return api.post(`/rdns/patients/${serviceRequestId}/annotation`, data);
};

type UseCreateAnnotationOptions = {
  mutationConfig?: MutationConfig<typeof createAnnotation>;
};

export const useCreateAnnotation = ({
  mutationConfig,
}: UseCreateAnnotationOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: getUpcomingCallsQueryOptions().queryKey,
      }),
        onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: createAnnotation,
  });
};
