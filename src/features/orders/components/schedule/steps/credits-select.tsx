import { Info } from 'lucide-react';
import React, { useCallback, useMemo } from 'react';
import { NavLink } from 'react-router-dom';

import { SelectableCard } from '@/components/shared/selectable-card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Body1, H2 } from '@/components/ui/typography';
import { MAX_TUBE_COUNT } from '@/const';
import { useServices } from '@/features/services/api';
import { cn } from '@/lib/utils';
import { Credit } from '@/types/api';
import { getServiceImage } from '@/utils/service';

import { useCredits } from '../../../api/credits';
import { useScheduleStore } from '../../../stores/schedule-store';
import { ScheduleFlowFooter } from '../schedule-flow-footer';

export const CreditsSelectStep = () => {
  const { selectedCreditIds, updateSelectedCreditIds, mode } = useScheduleStore(
    (s) => s,
  );

  const isDisabled = [...selectedCreditIds].length === 0;
  const isTestKit = mode === 'test-kit';

  return (
    <div className="flex flex-1 flex-col justify-between">
      <div className={cn('space-y-8')}>
        <div className="space-y-2">
          <H2>
            {isTestKit ? 'Select your test kits' : 'Schedule your appointment'}
          </H2>
          {isTestKit ? (
            <Body1 className="text-zinc-500">
              Select the test kits you&apos;d like to order. Your kit will be
              shipped to your address for at-home sample collection.
            </Body1>
          ) : (
            <Body1 className="text-zinc-500">
              For your health and safety, each appointment is limited to 14
              vials (a vial is a small blood sample tube). If your selection
              would go over the limit, you&apos;ll need to schedule an
              additional appointment.
            </Body1>
          )}
        </div>
        <CreditsSelectContent
          selectedIds={selectedCreditIds}
          setSelectedIds={updateSelectedCreditIds}
        />
      </div>
      <ScheduleFlowFooter nextBtnDisabled={isDisabled} />
    </div>
  );
};

type CreditsSelectContentProps = {
  selectedIds: Set<string>;
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  className?: string;
  isLoading?: boolean;
};

const CreditsSelectContent = ({
  selectedIds,
  setSelectedIds,
  className,
  isLoading = false,
}: CreditsSelectContentProps) => {
  const mode = useScheduleStore((s) => s.mode);
  const servicesQuery = useServices({ group: mode, includeUnorderable: true });
  const creditsQuery = useCredits();

  const isQueryLoading = servicesQuery.isLoading || creditsQuery.isLoading;

  const services = servicesQuery.data?.services ?? [];
  const credits = creditsQuery.data?.credits ?? [];

  const uniqueCredits = useMemo(() => {
    const seen = new Set<string>();

    return credits.filter((credit) => {
      if (seen.has(credit.serviceId)) {
        return false;
      }
      seen.add(credit.serviceId);
      return true;
    });
  }, [credits]);

  const tubeCountByServiceId = useMemo(
    () => new Map(services.map((s) => [s.id, s.bloodTubeCount ?? 0])),
    [services],
  );

  const totalTubes = useMemo(() => {
    let sum = 0;

    selectedIds.forEach((creditId) => {
      const credit = uniqueCredits.find((c) => c.id === creditId);
      if (!credit) return;

      const tubeCount = tubeCountByServiceId.get(credit.serviceId) ?? 0;
      sum += tubeCount;
    });

    return sum;
  }, [selectedIds, uniqueCredits, tubeCountByServiceId]);

  const anyWouldExceed = useMemo(() => {
    return services.some((service) => {
      const serviceTubes = service.bloodTubeCount ?? 0;
      const credit = uniqueCredits.find((c) => c.serviceId === service.id);

      if (!credit || selectedIds.has(credit.id)) return false;

      return totalTubes + serviceTubes > MAX_TUBE_COUNT;
    });
  }, [services, uniqueCredits, selectedIds, totalTubes]);

  const toggle = useCallback(
    (credit: Credit) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);

        if (next.has(credit.id)) {
          next.delete(credit.id);
          return next;
        }

        const serviceTubeCount =
          tubeCountByServiceId.get(credit.serviceId) ?? 0;

        // current total tubes from already selected credits
        let currentTotal = 0;
        prev.forEach((selectedCreditId) => {
          const selectedCredit = uniqueCredits.find(
            (c) => c.id === selectedCreditId,
          );
          if (!selectedCredit) return;
          currentTotal +=
            tubeCountByServiceId.get(selectedCredit.serviceId) ?? 0;
        });

        if (currentTotal + serviceTubeCount > MAX_TUBE_COUNT) {
          // reject add
          return prev;
        }

        next.add(credit.id);
        return next;
      });
    },
    [setSelectedIds, uniqueCredits, tubeCountByServiceId],
  );

  return (
    <>
      <div className={cn('space-y-2', className)}>
        {isQueryLoading &&
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton className="h-[106px] w-full rounded-[20px]" key={i} />
          ))}

        {!isQueryLoading && uniqueCredits.length === 0 ? (
          <div className="flex items-center justify-center rounded-xl border border-dashed px-3 py-10">
            <Body1 className="text-secondary">
              No credits available, get some{' '}
              <NavLink
                className="text-vermillion-900 underline"
                to="/marketplace"
              >
                here
              </NavLink>
            </Body1>
          </div>
        ) : null}

        {!isQueryLoading &&
          uniqueCredits.map((credit) => {
            const service = services.find((s) => s.id === credit.serviceId);
            if (!service) return;

            const checked = selectedIds.has(credit.id);

            const wouldExceed =
              !selectedIds.has(credit.id) &&
              totalTubes + (service.bloodTubeCount ?? 0) > MAX_TUBE_COUNT;

            const disabled = wouldExceed || isLoading;

            return (
              <SelectableCard
                key={credit.id}
                disabled={disabled}
                checked={checked}
                onToggle={() => toggle(credit)}
                title={service.name}
                imageSrc={getServiceImage(service.name)}
                description={
                  mode === 'phlebotomy'
                    ? `${service.bloodTubeCount} vials`
                    : service.description
                }
                trigger={
                  wouldExceed ? (
                    <Badge variant="outline" className="text-right">
                      Requires another appointment
                    </Badge>
                  ) : undefined
                }
              />
            );
          })}
      </div>

      {mode === 'phlebotomy' ? (
        <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row">
          {isQueryLoading ? (
            <Skeleton className="h-6 w-full" />
          ) : (
            <>
              <div className="flex items-center gap-2">
                <Body1 className="text-nowrap text-secondary">
                  Estimated Total: {totalTubes}/{MAX_TUBE_COUNT} vials
                </Body1>
                <EstimatedTooltip />
              </div>
              {totalTubes >= MAX_TUBE_COUNT && (
                <div className="flex items-center">
                  <Badge variant="vermillion">Limit reached</Badge>
                </div>
              )}
              {anyWouldExceed && totalTubes < MAX_TUBE_COUNT && (
                <div className="flex items-center">
                  <Body1 className="text-nowrap text-zinc-500">
                    Some tests require another appointment.
                  </Body1>
                </div>
              )}
            </>
          )}
        </div>
      ) : null}
    </>
  );
};

export const EstimatedTooltip = () => {
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
            For your comfort and safety, we limit each draw to 14 vials. This
            ensures we collect enough blood to run all your tests without taking
            more than your body can easily replenish in a single visit. If you’d
            like to add more tests, visit the Marketplace page in your dashboard
            and schedule another appointment.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
