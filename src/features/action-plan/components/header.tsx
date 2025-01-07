import moment from 'moment/moment';
import { useDebouncedCallback } from 'use-debounce';
import { useShallow } from 'zustand/react/shallow';

import { DatetimePicker } from '@/components/ui/input';
import { Body2, H2 } from '@/components/ui/typography';
import { usePlan } from '@/features/action-plan/stores/plan-store';
import { useCurrentPatient } from '@/features/rdns/hooks/use-current-patient';
import { useUser } from '@/lib/auth';

import { ACTION_PLAN_SAVE_DELAY } from '../const/delay';

export const Header = () => {
  const {
    isAdmin,
    timestamp,
    dateOverride,
    updateActionPlan,
    changeDateOverride,
  } = usePlan(useShallow((s) => s));

  const { fullPatientName } = useCurrentPatient();
  const { data: user } = useUser();

  const name = fullPatientName ?? `${user?.firstName} ${user?.lastName}`;

  const debouncedDateOverride = useDebouncedCallback(
    async (value: Date | undefined) => {
      if (value === undefined || moment(value).isSame(dateOverride, 'day'))
        return;

      changeDateOverride(value);
      await updateActionPlan();
    },
    ACTION_PLAN_SAVE_DELAY,
  );

  return (
    <div className="-mb-3">
      <div className="flex justify-center pb-2">
        {isAdmin ? (
          <DatetimePicker
            dtOptions={{
              date: dateOverride ? new Date(dateOverride) : new Date(timestamp),
            }}
            onChange={(e) => debouncedDateOverride(e)}
            format={[['months', 'days', 'years'], []]}
            className="bg-white"
          />
        ) : (
          <Body2 className="text-zinc-400">
            {dateOverride
              ? moment(dateOverride).format('MMM DD, YYYY')
              : moment(timestamp).format('MMM DD, YYYY')}
          </Body2>
        )}
      </div>
      <div className="flex justify-center">
        <H2>{name}&#39;s Action Plan</H2>
      </div>
      <div className="flex justify-center">
        <img src="/action-plan/header-transition.svg" alt="" />
      </div>
    </div>
  );
};
