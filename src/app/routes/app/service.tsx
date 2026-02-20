import { NavLink, useNavigate, useParams } from 'react-router';

import { NotFoundRoute } from '@/app/routes/not-found';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Spinner } from '@/components/ui/spinner';
import { PurchaseDialog } from '@/features/orders/components/purchase';
import { useServices } from '@/features/services/api';

export const ServiceRoute = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isError, isLoading } = useServices();
  const service = data?.services?.find((s) => s.id === id);

  if (isLoading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner variant="primary" size="lg" />
      </div>
    );
  }

  if (isError || !service) {
    return <NotFoundRoute />;
  }

  return (
    <div className="mx-auto w-full max-w-3xl py-9">
      <ServiceBreadcrumb className="px-6 md:px-16" service={service.name} />
      <PurchaseDialog
        healthcareService={service}
        onClose={() => navigate('/marketplace')}
      />
    </div>
  );
};

type ServiceBreadcrumbProps = {
  className?: string;
  service: string;
};

const ServiceBreadcrumb = ({ className, service }: ServiceBreadcrumbProps) => {
  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <NavLink to="/marketplace">Marketplace</NavLink>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>{service}</BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
};
