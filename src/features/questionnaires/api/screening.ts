import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';

export const screeningInputSchema = z.object({
  screeningResponse: z.any(), // fhir QuestionnaireResponse
});

export type ScreeningInput = z.infer<typeof screeningInputSchema>;

export const screening = ({
  data,
}: {
  data: ScreeningInput;
}): Promise<{ isIneligible: boolean }> => {
  return api.post(`/questionnaires/screening`, data);
};

type UseScreeningOptions = {
  mutationConfig?: MutationConfig<typeof screening>;
};

export const useScreening = ({ mutationConfig }: UseScreeningOptions = {}) => {
  const { ...restConfig } = mutationConfig || {};

  return useMutation({
    ...restConfig,
    mutationFn: screening,
  });
};
