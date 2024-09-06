import { ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Body1, Body2, H4 } from '@/components/ui/typography';
import { ADVISORY_CALL } from '@/const';
import { HealthcareServiceDialog } from '@/features/orders/components/healthcare-service-dialog';
import { useGetSchedulingLink } from '@/features/services/api/get-scheduling-link';
import { HealthcareService } from '@/types/api';

export const ServiceCard = ({ service }: { service: HealthcareService }) => {
  return (
    <>
      <DesktopCard service={service} />
      <MobileCard service={service} />
    </>
  );
};

const DesktopCard = ({ service }: { service: HealthcareService }) => {
  const schedulingLinkQuery = useGetSchedulingLink();
  const noSchedulingLink =
    service.name === ADVISORY_CALL &&
    (!schedulingLinkQuery.data?.link || schedulingLinkQuery.data.link === '');

  const renderButton = () => {
    if (!service.active || noSchedulingLink) {
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
        {schedulingLinkQuery.isLoading ? (
          <Spinner variant="primary" />
        ) : (
          'Get Started'
        )}
      </Button>
    );
  };

  return (
    <div className="hidden h-[386px] flex-col items-start rounded-3xl border border-zinc-100 bg-zinc-100 sm:flex">
      <img
        src={service.image}
        alt={service.name}
        className="h-[190px] w-full rounded-b-2xl rounded-t-3xl object-cover"
      />
      <div className="flex flex-1 flex-col justify-between sm:p-5">
        <div className="space-y-1">
          <H4 className="line-clamp-2 text-wrap">{service.name}</H4>
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
  return (
    <HealthcareServiceDialog healthcareService={service}>
      <div className="flex items-center justify-between gap-3 rounded-[20px] bg-zinc-100 px-5 py-4 sm:hidden">
        <img
          src={service.image}
          alt={service.name}
          className="size-9 rounded-lg object-cover"
        />
        <div>
          <Body1 className="line-clamp-1">{service.name}</Body1>
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
