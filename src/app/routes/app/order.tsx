import { useParams } from 'react-router';

import { NotFoundRoute } from '@/app/routes/not-found';
import { Spinner } from '@/components/ui/spinner';
import { useOrders } from '@/features/orders/api';
import { RescheduleFlow } from '@/features/orders/components/reschedule';
import { useServices } from '@/features/services/api';

export const OrderRoute = () => {
  const { id } = useParams();

  const getServicesQuery = useServices();
  const getOrdersQuery = useOrders();

  if (getOrdersQuery.isLoading || getServicesQuery.isLoading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner variant="primary" size="lg" />
      </div>
    );
  }

  if (getOrdersQuery.isError || getServicesQuery.isError) {
    return <NotFoundRoute />;
  }

  const requestGroup = getOrdersQuery.data?.requestGroups?.find(
    (rg) => rg.id === id,
  );

  if (!requestGroup) {
    return <NotFoundRoute />;
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-9 md:px-16">
      <RescheduleFlow requestGroup={requestGroup} />
    </div>
  );
};
