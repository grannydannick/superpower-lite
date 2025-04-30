import moment from 'moment';

import { Body2, H2 } from '@/components/ui/typography';
import { useCarePlan } from '@/features/plans/context/care-plan-context';

export function PlanTopper() {
  const { plan } = useCarePlan();
  const name = plan.subject?.display ?? 'Patient';

  const dateToFormat = plan.period?.start || plan.created || new Date();
  const formattedDate = moment(dateToFormat).format('MMM DD, YYYY');

  return (
    <div className="-mb-3">
      <div className="flex justify-center pb-2">
        <Body2 className="text-zinc-400">{formattedDate}</Body2>
      </div>
      <header className="flex flex-col items-center">
        <H2 className="text-center">
          {name}
          {name.endsWith('s') ? "'" : "'s"} Action Plan
        </H2>
        <img src="/action-plan/header-transition.svg" alt="transition" />
      </header>
    </div>
  );
}
