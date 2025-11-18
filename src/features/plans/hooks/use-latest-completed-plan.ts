import { useMemo } from 'react';

import { FhirCarePlan } from '@/types/api';

import { usePlans } from '../api';

const getTimestamp = (plan: FhirCarePlan) =>
  plan?.period?.start ? new Date(plan.period.start).getTime() : 0;

export const useLatestCompletedPlan = () => {
  const plansQuery = usePlans({});

  const latestPlan: FhirCarePlan | undefined = useMemo(() => {
    const plans = plansQuery.data?.actionPlans ?? [];
    return plans
      .filter((p: FhirCarePlan) => p.status === 'completed')
      .sort((a, b) => getTimestamp(b) - getTimestamp(a))?.[0];
  }, [plansQuery.data?.actionPlans]);

  const firstGoal = useMemo(() => {
    return latestPlan?.goal?.[0]?.resource;
  }, [latestPlan]);

  const goalObservations = useMemo(() => {
    return (
      (firstGoal?.addresses
        ?.map((a) => a.reference?.split('/')[1])
        .filter((r) => r !== undefined) as string[]) ?? []
    );
  }, [firstGoal]);

  const hasCompletedPlan = useMemo(() => {
    return Boolean(latestPlan?.period?.start);
  }, [latestPlan]);

  const latestCompletedPlanDate = useMemo(() => {
    if (!latestPlan?.period?.start) return null;

    const date = new Date(latestPlan.period.start);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, [latestPlan]);

  return {
    data: latestPlan,
    isLoading: plansQuery.isLoading,
    firstGoal,
    goalObservations,
    hasCompletedPlan,
    latestCompletedPlanDate,
  };
};
