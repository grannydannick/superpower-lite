import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { getUpcomingCallsQueryOptions } from '@/features/rdns/api/get-upcoming-calls';
import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { Annotation } from '@/types/api';

export const updateAnnotationSchema = z.object({
  text: z.string().min(1),
});

export type UpdateAnnotationInput = z.infer<typeof updateAnnotationSchema>;

export const updateAnnotation = ({
  data,
  annotationId,
}: {
  data: UpdateAnnotationInput;
  annotationId: string;
}): Promise<{ annotation: Annotation }> => {
  console.log(annotationId, data);
  return api.put(`/rdns/patients/${annotationId}/annotation`, data);
};

type UseUpdateAnnotationOptions = {
  mutationConfig?: MutationConfig<typeof updateAnnotation>;
};

export const useUpdateAnnotation = ({
  mutationConfig,
}: UseUpdateAnnotationOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: getUpcomingCallsQueryOptions().queryKey,
      });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: updateAnnotation,
  });
};
