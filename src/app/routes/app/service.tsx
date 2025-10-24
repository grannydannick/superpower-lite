import { useNavigate, useParams } from 'react-router-dom';

import { NotFoundRoute } from '@/app/routes/not-found';
import { Spinner } from '@/components/ui/spinner';
import { HealthcareServiceDialog } from '@/features/orders/components/healthcare-service-dialog';
import { useServices } from '@/features/services/api';

export const ServiceRoute = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const getServicesQuery = useServices();

  if (getServicesQuery.isLoading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner variant="primary" size="lg" />
      </div>
    );
  }

  if (getServicesQuery.isError) {
    return <NotFoundRoute />;
  }

  const service = getServicesQuery.data?.services?.find((s) => s.id === id);

  if (!service) {
    return <NotFoundRoute />;
  }

  return (
    <HealthcareServiceDialog
      healthcareService={service}
      onClose={() => navigate('/marketplace?tab=orders')}
    />
  );
};
