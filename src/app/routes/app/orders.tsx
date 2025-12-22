import { H3 } from '@/components/ui/typography';
import { FinishScheduleList } from '@/features/orders/components/finish-schedule-list';
import { RequestGroupsList } from '@/features/orders/components/request-groups-list';
import { OrderStatus } from '@/types/api';

export const OrdersRoute = () => {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-10 px-6 py-9 lg:px-0">
      <H3>Your orders</H3>
      <FinishScheduleList />

      <RequestGroupsList status={OrderStatus.active} />
      <RequestGroupsList status={OrderStatus.completed} />
    </div>
  );
};
