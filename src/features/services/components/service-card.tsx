import { ChevronRight } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProgressiveImage } from '@/components/ui/progressive-image';
import { Body1, Body2, H4 } from '@/components/ui/typography';
import { ADVANCED_BLOOD_PANEL, CUSTOM_BLOOD_PANEL } from '@/const';
import { HealthcareServiceDialog } from '@/features/orders/components/healthcare-service-dialog';
import { HealthcareService, Order } from '@/types/api';
import { customDisplayNameForService } from '@/utils/display-name-for-service';
import { getServiceImage } from '@/utils/service';

export const ServiceCard = ({
  service,
  draftOrder,
}: {
  service: HealthcareService;
  draftOrder?: Order;
}) => {
  return (
    <>
      <DesktopCard service={service} draftOrder={draftOrder} />
      <MobileCard service={service} />
    </>
  );
};

const DesktopCard = ({
  service,
  draftOrder,
}: {
  service: HealthcareService;
  draftOrder?: Order;
}) => {
  const renderButton = () => {
    if (draftOrder) {
      return <Button className="px-5 py-3">Schedule</Button>;
    }

    if (!service.active) {
      return (
        <Button
          variant="white"
          className="border border-zinc-200 px-5 py-3 hover:bg-white/30"
        >
          Request early access
        </Button>
      );
    }

    return (
      <Button
        variant="white"
        className="border border-zinc-200 px-5 py-3 hover:bg-white/30"
      >
        Get Started
      </Button>
    );
  };

  // WC: 2025-10-15 - This is a temporary function to display the custom display name for the service.
  // THIS IS AN UGLY HACK AND SHOULD BE REMOVED ASAP.
  const displayName = customDisplayNameForService(service);

  return (
    <div className="relative hidden h-[386px] flex-col items-start overflow-hidden rounded-3xl border border-zinc-100 bg-zinc-100 sm:flex">
      {[ADVANCED_BLOOD_PANEL, CUSTOM_BLOOD_PANEL].includes(service.name) && (
        <Badge className="absolute right-3 top-3 z-10 bg-vermillion-100 sm:block">
          <Body2 className="uppercase text-vermillion-900">New</Body2>
        </Badge>
      )}
      <ProgressiveImage
        src={getServiceImage(service.name)}
        alt={service.name}
        className="h-[190px] w-full rounded-b-2xl bg-white object-cover"
      />
      <div className="flex w-full flex-1 flex-col justify-between sm:p-5">
        <div className="space-y-1">
          <H4 className="line-clamp-2 text-wrap">{displayName}</H4>
          <Body2 className="line-clamp-2 text-wrap text-zinc-500">
            {service.description}
          </Body2>
        </div>

        <HealthcareServiceDialog healthcareService={service}>
          {renderButton()}
        </HealthcareServiceDialog>
      </div>
    </div>
  );
};

const MobileCard = ({ service }: { service: HealthcareService }) => {
  // WC: 2025-10-15 - This is a temporary function to display the custom display name for the service.
  // THIS IS AN UGLY HACK AND SHOULD BE REMOVED ASAP.
  const displayName = customDisplayNameForService(service);
  return (
    <HealthcareServiceDialog healthcareService={service}>
      <div className="flex items-center justify-between gap-3 rounded-[20px] bg-zinc-100 px-5 py-4 sm:hidden">
        <ProgressiveImage
          src={getServiceImage(service.name)}
          alt={service.name}
          className="size-9 rounded-lg object-cover"
        />
        <div>
          <Body1 className="line-clamp-1">{displayName}</Body1>
          <Body2 className="line-clamp-1 text-zinc-500">
            {service.description}
          </Body2>
        </div>
        <div className="flex items-center justify-center">
          <ChevronRight className="size-4 text-zinc-500" />
        </div>
      </div>
    </HealthcareServiceDialog>
  );
};
