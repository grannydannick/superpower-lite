import { ChevronRight } from 'lucide-react';
import { NavLink } from 'react-router';

import { H2 } from '@/components/ui/typography';
import { HealthcareService } from '@/types/api';

import { ServiceCard } from './service-card';

type ServiceCategoryProps = {
  title: string;
  subtitle?: string;
  services: HealthcareService[];
  path?: string;
};

export const ServiceCategory = ({
  title,
  subtitle,
  services,
  path,
}: ServiceCategoryProps) => {
  const handleViewAllClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col">
          <H2>{title}</H2>
          {subtitle && <H2 className="text-secondary">{subtitle}</H2>}
        </div>
        {path && (
          <NavLink
            to={path}
            className="inline-flex items-center gap-1 font-medium text-secondary hover:text-primary"
            onClick={handleViewAllClick}
          >
            View all
            <ChevronRight className="size-4" />
          </NavLink>
        )}
      </div>

      <div className="grid grid-cols-2 gap-x-2 gap-y-4 sm:gap-x-6 sm:gap-y-8 lg:grid-cols-4">
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
    </section>
  );
};
