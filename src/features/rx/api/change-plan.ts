import {
  QueryClient,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { MutationConfig, QueryConfig } from '@/lib/react-query';

import { getSubscriptionsQueryOptions } from './get-subscriptions';

// Any plan-change mutation invalidates both the dashboard subscription query
// (so the pending-change card appears/disappears) and the plan-options query
// (so the "already scheduled" badge inside the dialog stays in sync).
const invalidateRxPlanQueries = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({
    queryKey: getSubscriptionsQueryOptions().queryKey,
  });
  queryClient.invalidateQueries({ queryKey: ['rx-plan-options'] });
};

export interface PlanOption {
  billing_code: string;
  amount: number;
  interval_count: number;
  days_supply: number;
  fills_per_cycle: number;
  is_current: boolean;
  plan_label: string;
  plan_amount: string;
}

export interface PlanOptionsResponse {
  contract_id: string;
  medication_name: string;
  current_billing_code: string;
  pending_billing_code?: string;
  options: PlanOption[];
}

export interface ChangePlanResponse {
  contract_id: string;
  current_billing_code: string;
  pending_billing_code: string;
  message: string;
}

export interface CancelPlanChangeResponse {
  contract_id: string;
  status: string;
  message: string;
}

export const getPlanOptions = (
  contractId: string,
): Promise<PlanOptionsResponse> => {
  return api.get(`/rx/contract/${contractId}/plan-options`);
};

export const getPlanOptionsQueryOptions = (contractId: string | undefined) => {
  return queryOptions({
    queryKey: ['rx-plan-options', contractId],
    queryFn: () => getPlanOptions(contractId!),
    enabled: !!contractId,
    staleTime: 0,
  });
};

type UsePlanOptionsOptions = {
  contractId: string | undefined;
  queryConfig?: QueryConfig<typeof getPlanOptionsQueryOptions>;
};

export const usePlanOptions = ({
  contractId,
  queryConfig,
}: UsePlanOptionsOptions) => {
  return useQuery({
    ...getPlanOptionsQueryOptions(contractId),
    ...queryConfig,
  });
};

export const changePlan = ({
  id,
  billingCode,
}: {
  id: string;
  billingCode: string;
}): Promise<ChangePlanResponse> => {
  return api.post(`/rx/contract/${id}/change-plan`, {
    billing_code: billingCode,
  });
};

type UseChangePlanOptions = {
  mutationConfig?: MutationConfig<typeof changePlan>;
};

export const useChangePlan = ({
  mutationConfig,
}: UseChangePlanOptions = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      onSuccess?.(...args);
      invalidateRxPlanQueries(queryClient);
    },
    ...restConfig,
    mutationFn: changePlan,
  });
};

export const cancelPlanChange = (
  id: string,
): Promise<CancelPlanChangeResponse> => {
  return api.delete(`/rx/contract/${id}/change-plan`);
};

type UseCancelPlanChangeOptions = {
  mutationConfig?: MutationConfig<typeof cancelPlanChange>;
};

export const useCancelPlanChange = ({
  mutationConfig,
}: UseCancelPlanChangeOptions = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      onSuccess?.(...args);
      invalidateRxPlanQueries(queryClient);
    },
    ...restConfig,
    mutationFn: cancelPlanChange,
  });
};
