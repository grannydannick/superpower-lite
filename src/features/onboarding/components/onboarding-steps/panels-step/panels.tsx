import { InfoIcon } from 'lucide-react';
import React, { useCallback, useMemo } from 'react';

import { SelectableCard } from '@/components/shared/selectable-card';
import { Button } from '@/components/ui/button';
import { DialogClose } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Body1, Body2 } from '@/components/ui/typography';
import { ADVANCED_BLOOD_PANEL, SUPERPOWER_BLOOD_PANEL } from '@/const';
import { PurchaseDialog } from '@/features/orders/components/purchase';
import { useServices } from '@/features/services/api';
import { cn } from '@/lib/utils';
import { HealthcareService } from '@/types/api';
import { formatMoney } from '@/utils/format-money';
import { getServiceImage } from '@/utils/service';

type AddOnsProps = {
  selectedIds: Set<string>;
  toggleSelectedId: (panelId: string) => void;
  existingCreditIds?: Set<string>;
  className?: string;
  isLoading?: boolean;
};

// if anyone touches that or makes this logic worse u are dead man
export const AddOnPanelsSelect = ({
  selectedIds,
  toggleSelectedId,
  className,
  existingCreditIds = new Set<string>(),
  isLoading = false,
}: AddOnsProps) => {
  const servicesQuery = useServices({ group: 'phlebotomy' });
  let services = servicesQuery.data?.services ?? [];

  // filter out baseline + advanced panels
  services = services.filter(
    (s) => ![SUPERPOWER_BLOOD_PANEL, ADVANCED_BLOOD_PANEL].includes(s.name),
  );

  const toggle = useCallback(
    (service: HealthcareService) => {
      if (existingCreditIds.has(service.id)) return; // already purchased: immutable

      if (existingCreditIds.has(service.id)) {
        toggleSelectedId(service.id);
        return;
      }

      // Only toggle if validation passes
      toggleSelectedId(service.id);
    },
    [toggleSelectedId, existingCreditIds],
  );

  const totalPrice = useMemo(
    () =>
      services
        .filter((s) => selectedIds.has(s.id) && !existingCreditIds.has(s.id))
        .reduce((sum, s) => sum + s.price, 0),
    [services, selectedIds, existingCreditIds],
  );

  return (
    <>
      <div className={cn('space-y-2', className)}>
        {servicesQuery.isLoading &&
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton className="h-[106px] w-full rounded-[20px]" key={i} />
          ))}

        {!servicesQuery.isLoading &&
          services.map((s) => {
            const isPurchased = existingCreditIds.has(s.id);
            const checked = selectedIds.has(s.id);

            const disabled = isLoading;

            if (isPurchased) return null;

            return (
              <PanelInfoCard
                key={s.id}
                disabled={disabled}
                checked={checked}
                toggle={toggle}
                s={s}
              />
            );
          })}
      </div>

      <div className="mt-4 flex justify-between ">
        {servicesQuery.isLoading ? (
          <Skeleton className="h-6 w-full" />
        ) : (
          <>
            <Body1 className="text-secondary">
              Selected {selectedIds.size} services
            </Body1>

            <Body1>{formatMoney(totalPrice)}</Body1>
          </>
        )}
      </div>
    </>
  );
};

const PanelInfoCard = ({
  s,
  checked,
  toggle,
  disabled,
}: {
  s: HealthcareService;
  disabled: boolean;
  checked: boolean;
  toggle: (s: HealthcareService) => void;
}) => {
  return (
    <SelectableCard
      disabled={disabled}
      checked={checked}
      title={s.name}
      imageSrc={getServiceImage(s.name)}
      description={s.description}
      onToggle={() => toggle(s)}
      price={s.price}
      details={() => ({
        trigger: (
          <PurchaseDialog
            healthcareService={s}
            flow="info"
            infoFlowBtn={() => (
              <DialogClose asChild>
                <Button
                  className="w-full"
                  onClick={() => {
                    if (!disabled) toggle(s);
                  }}
                >
                  Add
                </Button>
              </DialogClose>
            )}
          >
            <div className="group flex cursor-pointer items-center gap-1.5">
              <Body2 className="line-clamp-2 text-secondary transition-all duration-200 group-hover:text-zinc-700">
                Learn more
              </Body2>
              <InfoIcon className="size-4 text-zinc-400 transition-all duration-200 group-hover:text-zinc-500" />
            </div>
          </PurchaseDialog>
        ),
      })}
    />
  );
};
