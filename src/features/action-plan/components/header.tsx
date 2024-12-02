import moment from 'moment/moment';

import { Body2, H2 } from '@/components/ui/typography';
import { usePlan } from '@/features/action-plan/stores/plan-store';
import { useCurrentPatient } from '@/features/rdns/hooks/use-current-patient';
import { useUser } from '@/lib/auth';

export const Header = () => {
  const timestamp = usePlan((s) => s.timestamp);
  const { fullPatientName } = useCurrentPatient();
  const { data: user } = useUser();

  const name = fullPatientName ?? `${user?.firstName} ${user?.lastName}`;

  return (
    <div className="-mb-3">
      <div className="flex justify-center pb-2">
        <Body2 className="text-zinc-400">
          {moment(timestamp).format('MMM DD, YYYY')}
        </Body2>
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
