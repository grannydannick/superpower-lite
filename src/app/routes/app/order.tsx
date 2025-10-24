import { useParams } from 'react-router-dom';

import { NotFoundRoute } from '@/app/routes/not-found';
import { Spinner } from '@/components/ui/spinner';
import { useOrders } from '@/features/orders/api';
import { HealthcareServiceReschedule } from '@/features/orders/components/reschedule';
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

  const order = getOrdersQuery.data?.orders?.find((o) => o.id === id);
  const service = getServicesQuery.data?.services?.find(
    (s) => s.id === order?.serviceId,
  );

  if (!order || !service) {
    return <NotFoundRoute />;
  }

  return (
    <HealthcareServiceReschedule order={order} healthcareService={service} />
  );
};
