import { Info } from 'lucide-react';
import React, { useCallback, useMemo } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Body1, H3 } from '@/components/ui/typography';
import { MAX_TUBE_COUNT, SUPERPOWER_BLOOD_PANEL } from '@/const';
import { HealthcareServiceFooter } from '@/features/orders/components/healthcare-service-footer';
import { HEALTHCARE_SERVICE_DIALOG_CONTAINER_STYLE } from '@/features/orders/const/config';
import { useHasCredit } from '@/features/orders/hooks';
import { useOrder } from '@/features/orders/stores/order-store';
import { useServices } from '@/features/services/api';
import { ServiceSelectCard } from '@/features/services/components/service-select-card';
import { cn } from '@/lib/utils';
import { HealthcareService } from '@/types/api';
import { formatMoney } from '@/utils/format-money';

export const Panels = () => {
  const { addOnIds, updateAddOnIds, service } = useOrder((s) => s);
  const { credit } = useHasCredit({
    serviceName: service.name,
  });

  const isDisabled =
    [...addOnIds, ...(credit?.addOnServiceIds ?? [])].length === 0;

  return (
    <>
      <div
        className={cn('space-y-8', HEALTHCARE_SERVICE_DIALOG_CONTAINER_STYLE)}
      >
        <H3>Choose your panels</H3>
        <AddOnPanelsSelect
          existingCreditIds={new Set(credit?.addOnServiceIds ?? [])}
          selectedIds={addOnIds}
          setSelectedIds={updateAddOnIds}
        />
      </div>
      <HealthcareServiceFooter nextBtnDisabled={isDisabled} />
    </>
  );
};

type AddOnsProps = {
  selectedIds: Set<string>;
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  existingCreditIds?: Set<string>;
  className?: string;
  isLoading?: boolean;
};

// if anyone touches that or makes this logic worse u are dead man
export const AddOnPanelsSelect = ({
  selectedIds,
  setSelectedIds,
  existingCreditIds,
  className,
  isLoading = false,
}: AddOnsProps) => {
  const addOnServicesQuery = useServices({ group: 'blood-panel-addon' });
  const visibleServices = addOnServicesQuery.data?.services ?? [];

  const ownedIds = useMemo(
    () => existingCreditIds ?? new Set<string>(),
    [existingCreditIds],
  );

  const hasBaselineCredit = useMemo(() => {
    for (const id of ownedIds) {
      if (id.toLowerCase().includes('baseline')) return true;
    }
    return false;
  }, [ownedIds]);

  // temporary hack to hide baseline if credit is not present
  const services = useMemo(() => {
    if (hasBaselineCredit) return visibleServices;
    return visibleServices.filter((s) => s.name !== SUPERPOWER_BLOOD_PANEL);
  }, [visibleServices, hasBaselineCredit]);

  const tubeCountById = useMemo(
    () => new Map(services.map((s) => [s.id, s.bloodTubeCount ?? 0])),
    [services],
  );

  const baseTubes = useMemo(() => {
    let sum = 0;
    ownedIds.forEach((id) => {
      sum += tubeCountById.get(id) ?? 0;
    });
    return sum;
  }, [ownedIds, tubeCountById]);

  const totalTubes = useMemo(() => {
    let sum = baseTubes;
    selectedIds.forEach((id) => {
      if (!ownedIds.has(id)) sum += tubeCountById.get(id) ?? 0;
    });
    return sum;
  }, [baseTubes, selectedIds, ownedIds, tubeCountById]);

  const toggle = useCallback(
    (service: HealthcareService) => {
      if (ownedIds.has(service.id)) return; // already purchased: immutable

      setSelectedIds((prev) => {
        const next = new Set(prev);

        if (next.has(service.id)) {
          next.delete(service.id);
          return next;
        }

        // recompute current total from prev (excluding owned)
        let currentTotal = baseTubes;
        prev.forEach((id) => {
          if (!ownedIds.has(id)) currentTotal += tubeCountById.get(id) ?? 0;
        });

        const addCount = service.bloodTubeCount ?? 0;
        if (currentTotal + addCount > MAX_TUBE_COUNT) return prev; // reject add

        next.add(service.id);
        return next;
      });
    },
    [setSelectedIds, baseTubes, ownedIds, tubeCountById],
  );

  const totalPrice = useMemo(
    () =>
      services
        .filter((s) => selectedIds.has(s.id) && !ownedIds.has(s.id))
        .reduce((sum, s) => sum + s.price, 0),
    [services, selectedIds, ownedIds],
  );

  return (
    <>
      <div className={cn('space-y-2', className)}>
        {addOnServicesQuery.isLoading &&
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton className="h-[106px] w-full rounded-[20px]" key={i} />
          ))}

        {!addOnServicesQuery.isLoading &&
          services.map((s) => {
            const isPurchased = ownedIds.has(s.id);
            const checked = isPurchased || selectedIds.has(s.id);

            const wouldExceed =
              !isPurchased &&
              !selectedIds.has(s.id) &&
              totalTubes + (s.bloodTubeCount ?? 0) > MAX_TUBE_COUNT;

            const disabled = isPurchased || wouldExceed || isLoading;

            return (
              <ServiceSelectCard
                disabled={disabled}
                checked={checked}
                service={s}
                toggle={toggle}
                key={s.id}
              />
            );
          })}
      </div>

      <div className="mt-4 flex justify-between">
        {addOnServicesQuery.isLoading ? (
          <Skeleton className="h-6 w-full" />
        ) : (
          <>
            <div className="flex items-center gap-2">
              <Body1 className="text-secondary">
                Estimated Total: {totalTubes}/{MAX_TUBE_COUNT} tubes
              </Body1>
              <EstimatedTooltip />
            </div>
            <Body1>{formatMoney(totalPrice)}</Body1>
          </>
        )}
      </div>
    </>
  );
};

const EstimatedTooltip = () => {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={75}>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="size-5 cursor-help touch-manipulation select-none text-zinc-400 transition-all hover:text-zinc-600 active:text-zinc-600"
            aria-label="Show citation details"
          >
            <Info className="size-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-xs"
          collisionPadding={{
            right: 8,
            left: 8,
            top: 8,
            bottom: 8,
          }}
        >
          <p>
            For your comfort and safety, we limit each draw to 14 tubes. This
            ensures we collect enough blood to run all your tests without taking
            more than your body can easily replenish in a single visit. If
            you&apos;d like to add even more tests, you can visit the Services
            page in your dashboard and schedule another appointment.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
