import { H4 } from '@/components/ui/typography';

import { useRxTasks } from '../api/get-tasks';

import { RxActionCard } from './rx-action-card';

export const RxTasks = () => {
  const rxTasksQuery = useRxTasks();

  const failedPayments = rxTasksQuery.data?.failed_payments ?? 0;

  // todo: with other cases extended here add TOTAL
  if (failedPayments === 0) return null;

  return (
    <div className="space-y-2">
      <H4>Tasks</H4>
      <div>
        {failedPayments > 0 ? (
          <RxActionCard config="FAILED_PAYMENT" variant="highlighted" />
        ) : null}
      </div>
    </div>
  );
};
