import moment from 'moment';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Body1, H3 } from '@/components/ui/typography';
import { usePlans, useCheckActionPlanViewed } from '@/features/plans/api';
import { useAnalytics } from '@/hooks/use-analytics';
import { FhirCarePlan } from '@/types/api';

import { CarePlanBook } from './care-plan-book';

const getTimestamp = (plan: FhirCarePlan) =>
  plan?.period?.start ? new Date(plan.period.start).getTime() : 0;

const STORAGE_KEY_PREFIX = 'care_plan_viewed_';

// Don't show the modal to users that have AIAPs before this date
// Prevents legacy users from seeing the modal
const AIAP_PUBLISH_CUTOFF_DATE = new Date('2025-09-01');

const getLocalStorageViewed = (planId: string): string | null => {
  try {
    return localStorage.getItem(`${STORAGE_KEY_PREFIX}${planId}`);
  } catch {
    return null;
  }
};

const setLocalStorageViewed = (planId: string, timestamp: string) => {
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${planId}`, timestamp);
  } catch (error) {
    console.error('Failed to save to localStorage', error);
  }
};

export const CarePlanModal = () => {
  const getPlansQuery = usePlans({});
  const navigate = useNavigate();

  // find the latest available plan -> completed, newest start date
  const latestPlan: FhirCarePlan | undefined = useMemo(() => {
    const plans = getPlansQuery.data?.actionPlans ?? [];
    return plans
      .filter((p: FhirCarePlan) => p.status === 'completed')
      .sort((a, b) => getTimestamp(b) - getTimestamp(a))?.[0];
  }, [getPlansQuery.data?.actionPlans]);

  const startDate = latestPlan?.period?.start;
  const formattedDate = startDate
    ? moment.utc(startDate).format('MMM DD, YYYY')
    : '';

  // Check backend for viewed status
  const viewStatusQuery = useCheckActionPlanViewed({
    planId: latestPlan?.id ?? '',
    queryConfig: {
      enabled: !!latestPlan?.id,
    },
  });

  const { track } = useAnalytics();

  const [_open, _setOpen] = useState(false);

  useEffect(() => {
    if (!latestPlan?.id) {
      _setOpen(false);
      return;
    }

    // Don't show the modal to users that have AIAPs before this date
    // Prevents legacy users from seeing the modal
    if (!startDate || moment(startDate).isBefore(AIAP_PUBLISH_CUTOFF_DATE)) {
      _setOpen(false);
      return;
    }

    // First check localStorage for fast response
    const localViewed = getLocalStorageViewed(latestPlan.id);
    if (localViewed) {
      _setOpen(false);
      return;
    }

    // Then check backend
    if (viewStatusQuery.data) {
      const shouldShow = !viewStatusQuery.data.hasBeenViewed;
      _setOpen(shouldShow);

      // If backend says it's been viewed, cache it in localStorage
      if (
        viewStatusQuery.data.hasBeenViewed &&
        viewStatusQuery.data.lastViewedAt
      ) {
        setLocalStorageViewed(latestPlan.id, viewStatusQuery.data.lastViewedAt);
      }
    }
  }, [latestPlan?.id, viewStatusQuery.data, startDate, track]);

  const markAsViewed = useCallback((id: string) => {
    const timestamp = new Date().toISOString();
    setLocalStorageViewed(id, timestamp);
  }, []);

  const onOpenChange = useCallback(
    (next: boolean) => {
      if (!next && latestPlan?.id) {
        markAsViewed(latestPlan.id);
      }
      _setOpen(next);
    },
    [latestPlan?.id, markAsViewed],
  );

  if (!latestPlan) return null;

  const handleOpenPlan = () => {
    if (!latestPlan?.id) return;
    markAsViewed(latestPlan.id);
    track('aiap_opened_from_modal', {
      action_plan_id: latestPlan.id,
    });
    _setOpen(false);
    navigate(`/plans/${latestPlan.id}`);
  };

  const handleDismiss = () => {
    if (!latestPlan?.id) return;
    markAsViewed(latestPlan.id);
    track('aiap_modal_dismissed', {
      action_plan_id: latestPlan.id,
    });
    _setOpen(false);
  };

  return (
    <Dialog open={_open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-2rem)] space-y-8 px-8 pb-4 pt-12 sm:max-w-md">
        <div className="group mx-auto inline-block -rotate-3">
          <CarePlanBook title="Action Plan" date={formattedDate} />
        </div>
        <div className="space-y-6">
          <div className="mx-auto max-w-sm space-y-2">
            <H3 className="text-center">Your action plan is ready</H3>
            <Body1 className="text-center text-secondary">
              Superpower has analyzed your lab results and built a precise
              action plan, tailored to you.
            </Body1>
          </div>
          <div className="flex flex-col justify-center">
            <Button
              onClick={handleOpenPlan}
              variant="default"
              className="rounded-full text-center"
            >
              Take me to my action plan
            </Button>
            <Button
              variant="ghost"
              className="text-center"
              onClick={handleDismiss}
            >
              I’m not interested right now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
