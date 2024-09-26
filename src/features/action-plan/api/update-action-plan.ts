import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { actionPlanGoalSchema } from '@/features/action-plan/api/create-action-plan';
import { getPlansQueryOptions } from '@/features/action-plan/api/get-plans';
import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { Plan } from '@/types/api';

export const annualReportPlanInputSchema = z.object({
  id: z.string(),
  title: z.string().min(2, 'Plan title must contain at least 2 character(s)'),
  description: z.string().optional(),
  block: z.array(z.any()), // TODO: change me later
});

export type AnnualReportPlanInput = z.infer<typeof annualReportPlanInputSchema>;

const baseSchema = {
  orderId: z.string().min(1),
  description: z.string().optional(),
  published: z.boolean(),
  goals: z.array(actionPlanGoalSchema),
  annualReport: annualReportPlanInputSchema.optional(),
};

// Schema for type 'DEFAULT' where title is required
const defaultPlanSchema = z.object({
  ...baseSchema,
  type: z.literal('DEFAULT'),
  title: z.string().min(2, 'Plan title must contain at least 2 character(s)'),
});

// Schema for type 'ANNUAL_REPORT' where title is optional
const annualReportPlanSchema = z.object({
  ...baseSchema,
  type: z.literal('ANNUAL_REPORT'),
  title: z.string().optional(),
});

// Combine them into a discriminated union
export const updatePlanInputSchema = z.discriminatedUnion('type', [
  defaultPlanSchema,
  annualReportPlanSchema,
]);

export type UpdatePlanInput = z.infer<typeof updatePlanInputSchema>;

export const updatePlan = ({
  data,
}: {
  data: UpdatePlanInput;
}): Promise<{ actionPlan: Plan }> => {
  return api.put('/plans', data);
};

type UseUpdatePlanOptions = {
  mutationConfig?: MutationConfig<typeof updatePlan>;
};

export const useUpdatePlan = ({
  mutationConfig,
}: UseUpdatePlanOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: getPlansQueryOptions().queryKey,
      });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: updatePlan,
  });
};
