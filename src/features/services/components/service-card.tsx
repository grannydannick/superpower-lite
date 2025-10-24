import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProgressiveImage } from '@/components/ui/progressive-image';
import { Body1, Body2, Body3, H4 } from '@/components/ui/typography';
import { HealthcareService, Order } from '@/types/api';
import { customDisplayNameForService } from '@/utils/display-name-for-service';
import { formatMoney } from '@/utils/format-money';
import { getServiceImage, getServiceBadge } from '@/utils/service';

export const ServiceCard = ({
  service,
  draftOrder,
}: {
  service: HealthcareService;
  draftOrder?: Order;
}) => {
  const badge = getServiceBadge(service.name);

  return (
    <>
      <DesktopCard service={service} badge={badge} draftOrder={draftOrder} />
      <MobileCard service={service} badge={badge} draftOrder={draftOrder} />
    </>
  );
};

const DesktopCard = ({
  service,
  badge,
  draftOrder,
}: {
  service: HealthcareService;
  badge?: string | null;
  draftOrder?: Order;
}) => {
  const navigate = useNavigate();

  const renderButton = () => {
    if (draftOrder) {
      return (
        <Button className="absolute inset-x-4 bottom-4" size="medium">
          Schedule
        </Button>
      );
    }

    return (
      <Button
        className="ease-[cubic-bezier(0.22,_0.61,_0.35,_1)] pointer-events-none absolute inset-x-4 bottom-4 translate-y-2 opacity-0 blur-sm transition-all duration-200 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-hover:blur-0"
        size="medium"
      >
        Book now
      </Button>
    );
  };

  const displayName = customDisplayNameForService(service);

  return (
    <button
      className="group relative hidden cursor-pointer flex-col gap-4 overflow-hidden sm:flex"
      onClick={() => navigate(`/services/${service.id}`)}
    >
      {badge && !draftOrder ? (
        <Badge className="absolute right-6 top-6 z-20 gap-1 bg-vermillion-100 sm:flex">
          <Check color="#fc5f2b" size={16} />
          <Body2 className="text-vermillion-900">{badge}</Body2>
        </Badge>
      ) : null}

      <div className="relative flex aspect-[456/501] items-center rounded-[20px] bg-zinc-50">
        {/* The bg-zinc-50 helps prevent strobing on transparent images; see comment in progressive-image.tsx */}
        <ProgressiveImage
          src={getServiceImage(service.name)}
          alt={service.name}
          className="h-[300px] w-full rounded-[20px] bg-zinc-50 object-contain"
        />
        {renderButton()}
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <H4>{displayName}</H4>
          {service.price > 0 ? <H4>{formatMoney(service.price)}</H4> : null}
        </div>
        <Body1 className="text-secondary">
          {service.additionalClassification[0]}
        </Body1>
      </div>
    </button>
  );
};

const MobileCard = ({
  service,
  badge,
  draftOrder,
}: {
  service: HealthcareService;
  badge?: string | null;
  draftOrder?: Order;
}) => {
  const navigate = useNavigate();
  const displayName = customDisplayNameForService(service);

  return (
    <button
      className="flex flex-col gap-2 sm:hidden"
      onClick={() => navigate(`/services/${service.id}`)}
    >
      <ProgressiveImage
        src={getServiceImage(service.name)}
        alt={service.name}
        className="aspect-square w-full rounded-[20px] bg-zinc-50 object-contain"
      />

      <div className="flex flex-col gap-1">
        <Body3 className="text-secondary">
          {service.additionalClassification[0]}
        </Body3>
        <Body2 className="line-clamp-1">{displayName}</Body2>

        {service.price > 0 ? <Body2>{formatMoney(service.price)}</Body2> : null}
      </div>
      {draftOrder ? (
        <Button className="flex w-full" size="medium">
          Schedule
        </Button>
      ) : null}
      {badge && !draftOrder ? (
        <Badge className="max-w-fit gap-2 bg-vermillion-100 sm:flex">
          <Check color="#fc5f2b" size={16} />
          <Body2 className="text-vermillion-900">{badge}</Body2>
        </Badge>
      ) : null}
    </button>
  );
};
