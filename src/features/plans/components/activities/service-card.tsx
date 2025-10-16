import { Coding } from '@medplum/fhirtypes';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Body2 } from '@/components/ui/typography';
import {
  ADVISORY_CALL,
  CUSTOM_BLOOD_PANEL,
  AUTOIMMUNITY_AND_CELIAC_PANEL,
  CARDIOVASCULAR_PANEL,
  METABOLIC_PANEL,
  METHYLATION_PANEL,
  FEMALE_FERTILITY_PANEL,
  NUTRIENT_AND_ANTIOXIDANT_PANEL,
} from '@/const';
import { useOrders } from '@/features/orders/api';
import { HealthcareServiceDialog } from '@/features/orders/components/healthcare-service-dialog';
import { useServices } from '@/features/services/api';
import { HealthcareService, OrderStatus } from '@/types/api';
import { getServiceImage } from '@/utils/service';

import { ActivityCard } from './activity-card';

type ServiceCardProps = {
  service?: HealthcareService;
  serviceCoding?: Coding;
  className?: string;
  buttonVariant?: 'default' | 'outline';
  showButton?: boolean;
  description?: React.ReactNode;
};

export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  serviceCoding,
  className,
  buttonVariant = 'default',
  showButton = true,
  description,
}) => {
  const { data: servicesData } = useServices();
  const { data: addOnServicesData } = useServices({
    group: 'blood-panel-addon',
  });
  const ordersQuery = useOrders();
  const ordersData = ordersQuery.data;

  const baseServices = servicesData?.services ?? [];
  const addonServices = addOnServicesData?.services ?? [];
  const resolvedService: HealthcareService | undefined = (() => {
    if (service) return service;

    if (serviceCoding?.code) {
      return (
        baseServices.find((s) => s.id === serviceCoding.code) ||
        addonServices.find((s) => s.id === serviceCoding.code)
      );
    }

    if (serviceCoding?.display) {
      const display = (serviceCoding.display || '').toLowerCase();
      return (
        baseServices.find((s) => s.name.toLowerCase() === display) ||
        addonServices.find((s) => s.name.toLowerCase() === display)
      );
    }
    return undefined;
  })();

  const name = resolvedService?.name || serviceCoding?.display || 'Service';
  const image = getServiceImage(name);

  const isAdvisory = name === ADVISORY_CALL;
  const isServiceScheduled = ordersData?.orders
    ? ordersData.orders.some(
        (order) =>
          order.serviceId === resolvedService?.id &&
          (order.status === OrderStatus.upcoming ||
            order.status === OrderStatus.pending),
      )
    : false;
  const shouldShowEarlyAccess = resolvedService
    ? !resolvedService.active
    : false;
  const message = isAdvisory
    ? 'Not currently available.'
    : isServiceScheduled
      ? 'Service scheduled'
      : shouldShowEarlyAccess
        ? 'Request Early Access'
        : 'Available for booking';

  // Specialty panels should be booked through Custom Blood Panel with preselection
  const isSpecialtyPanel = [
    AUTOIMMUNITY_AND_CELIAC_PANEL,
    CARDIOVASCULAR_PANEL,
    METABOLIC_PANEL,
    METHYLATION_PANEL,
    FEMALE_FERTILITY_PANEL,
    NUTRIENT_AND_ANTIOXIDANT_PANEL,
  ].includes(resolvedService?.name || '');

  const customPanelService = baseServices.find(
    (s) => s.name === CUSTOM_BLOOD_PANEL,
  );

  const bookingService = isSpecialtyPanel
    ? customPanelService
    : resolvedService;

  const preselectedAddOnIds =
    isSpecialtyPanel && resolvedService ? [resolvedService.id] : undefined;

  return (
    <ActivityCard
      name={name}
      image={image}
      className={className}
      description={
        description ? (
          <Body2 className="text-secondary">{description}</Body2>
        ) : (
          <div className="flex items-center gap-2">
            {ordersQuery.isLoading ? (
              <Skeleton className="h-4 w-40" />
            ) : (
              <Body2 className="italic text-secondary">{message}</Body2>
            )}
          </div>
        )
      }
      actionBtn={
        showButton && bookingService && !isAdvisory && !isServiceScheduled ? (
          <HealthcareServiceDialog
            healthcareService={bookingService}
            initialAddOnIds={preselectedAddOnIds}
          >
            <Button size="medium" variant={buttonVariant}>
              {shouldShowEarlyAccess ? 'Request' : 'Book now'}
            </Button>
          </HealthcareServiceDialog>
        ) : undefined
      }
    />
  );
};
