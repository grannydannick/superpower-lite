import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { getPlansQueryOptions } from '@/features/action-plan/api/get-plans';
import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { Plan } from '@/types/api';

export const actionPlanGoalItemSchema = z.object({
  itemId: z.string().min(1, 'itemId must be present'),
  itemType: z.enum(['SERVICE', 'BIOMARKER', 'PRODUCT']),
  description: z.string().optional().nullable(),
  timestamp: z.string().optional().nullable(),
});

export const actionPlanGoalSchema = z.object({
  title: z.string().min(2, 'Goal title must contain at least 2 character(s)'),
  description: z.string().optional(),
  to: z.string(),
  from: z.string(),
  goalItems: z.array(actionPlanGoalItemSchema),
  type: z.enum([
    'DEFAULT',
    'ANNUAL_REPORT_PRIMARY',
    'ANNUAL_REPORT_SECONDARY',
    'ANNUAL_REPORT_PROTOCOLS',
  ]),
});

export const createPlanInputSchema = z.object({
  orderId: z.string().min(1, 'Order ID must be present'),
  title: z.string().optional(),
  description: z.string().optional(),
  published: z.boolean(),
  goals: z.array(actionPlanGoalSchema),
});

export type CreatePlanInput = z.infer<typeof createPlanInputSchema>;

export const createPlan = ({
  data,
}: {
  data: CreatePlanInput;
}): Promise<{ actionPlan: Plan }> => {
  return api.post('/plans', data);
};

type UseCreatePlanOptions = {
  mutationConfig?: MutationConfig<typeof createPlan>;
};

export const useCreatePlan = ({
  mutationConfig,
}: UseCreatePlanOptions = {}) => {
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
    mutationFn: createPlan,
  });
};
