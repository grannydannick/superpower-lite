import { Dot } from 'lucide-react';
import moment from 'moment';
import React from 'react';

import { AddToCalendar } from '@/components/shared/add-to-calendar-button';
import { Button } from '@/components/ui/button';
import { Body1, Body2 } from '@/components/ui/typography';
import {
  GRAIL_GALLERI_MULTI_CANCER_TEST,
  GUT_MICROBIOME_ANALYSIS,
  TOTAL_TOXIN_TEST,
} from '@/const';
import { useOnboarding } from '@/features/onboarding/stores/onboarding-store';
import { HealthcareService } from '@/types/api';

export const AdditionalServiceCard = ({
  service,
  onEdit,
}: {
  service: HealthcareService;
  onEdit?: () => void;
}) => {
  const { slots, serviceAddress } = useOnboarding();

  const conditions = {
    [GRAIL_GALLERI_MULTI_CANCER_TEST]: slots.cancer,
    [GUT_MICROBIOME_ANALYSIS]: slots.microbiome,
    [TOTAL_TOXIN_TEST]: slots.toxin,
  };

  if (!conditions[service.name as keyof typeof conditions]) {
    return;
  }

  const renderInfo = () => {
    switch (service.name) {
      case GRAIL_GALLERI_MULTI_CANCER_TEST:
        return (
          <div className="flex items-center gap-1.5">
            <Body2 className="text-zinc-500">At home visit</Body2>
            <Dot className="text-zinc-500" />
            <Body2 className="text-zinc-500">
              {moment(slots.cancer?.slot?.start).format(
                'MMMM Do YYYY, h:mm A',
              ) ?? 'soon'}
            </Body2>
          </div>
        );
      case GUT_MICROBIOME_ANALYSIS:
        return (
          <div className="flex items-center gap-1.5">
            <Body2 className="text-zinc-500">{`Ships to ${slots?.microbiome.address?.line.join(' ')}`}</Body2>
            <Dot className="text-zinc-500" />
            <Body2 className="text-zinc-500">
              Arriving in 2-3 business days
            </Body2>
          </div>
        );
      case TOTAL_TOXIN_TEST:
        return (
          <div className="flex items-center gap-1.5">
            <Body2 className="text-zinc-500">{`Ships to ${slots?.toxin.address?.line.join(' ')}`}</Body2>
            <Dot className="text-zinc-500" />
            <Body2 className="text-zinc-500">
              Arriving in 2-3 business days
            </Body2>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex gap-4 rounded-xl border border-zinc-200 p-4">
      <img
        className="size-[56px] rounded-lg object-cover"
        src={service.image}
        alt="service"
      />
      <div className="flex w-full items-center justify-between">
        <div className="flex flex-col justify-center gap-1">
          <div className="flex items-center gap-1.5">
            <Body1 className="text-zinc-900">{service.name}</Body1>
            {onEdit && (
              <div className="flex items-center gap-1.5">
                <Dot className="text-zinc-500" />
                <Button
                  variant="ghost"
                  className="p-0 text-sm text-zinc-500"
                  onClick={onEdit}
                >
                  Edit
                </Button>
              </div>
            )}
          </div>
          <Body2 className="line-clamp-1 text-zinc-500">{renderInfo()}</Body2>
        </div>
        {!onEdit &&
          service.name === GRAIL_GALLERI_MULTI_CANCER_TEST &&
          serviceAddress &&
          slots.cancer.slot && (
            <AddToCalendar
              service={service.name}
              address={serviceAddress.address}
              slot={slots.cancer.slot}
              collectionMethod="AT_HOME"
            />
          )}
      </div>
    </div>
  );
};
