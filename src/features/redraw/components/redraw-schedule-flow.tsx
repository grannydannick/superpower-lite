import { ChevronLeft } from 'lucide-react';
import { useState } from 'react';

import { SuperpowerLogo } from '@/components/icons/superpower-logo';
import { Button } from '@/components/ui/button';
import { TransactionSpinner } from '@/components/ui/spinner/transaction-spinner';
import { Body1, Body2, H2 } from '@/components/ui/typography';
import { AppointmentDetails } from '@/features/orders/components/appointment-details';
import { AtHomeScheduler } from '@/features/orders/components/schedule/at-home-scheduler';
import { InLabScheduler } from '@/features/orders/components/schedule/in-lab-scheduler';
import { ScheduleStoreProvider } from '@/features/orders/stores/schedule-store';
import { useScheduleStore } from '@/features/orders/stores/schedule-store';
import { getCollectionInstructions } from '@/features/orders/utils/get-collection-instructions';
import { MemberRedraw } from '@/features/redraw/api/get-redraws';
import type { operations } from '@/orpc/types.generated';
import { getServiceImage } from '@/utils/service';

type ScheduleRedrawInput =
  operations['redraw.scheduleRedraw']['requestBody']['content']['application/json'];
type SupportedRedrawCollectionMethod = 'AT_HOME' | 'IN_LAB';

type RedrawScheduleFlowProps = {
  redraw: Pick<
    MemberRedraw,
    'serviceRequestId' | 'serviceName' | 'serviceNames'
  > & {
    collectionMethod: SupportedRedrawCollectionMethod;
  };
  onBack: () => void;
  onConfirm: (payload: ScheduleRedrawInput) => Promise<void> | void;
  isPending?: boolean;
};

type ScheduleStep = 'scheduler' | 'summary';

export const RedrawScheduleFlow = ({
  redraw,
  onBack,
  onConfirm,
  isPending = false,
}: RedrawScheduleFlowProps) => {
  if (!redraw.collectionMethod) {
    throw new Error('Redraw scheduling requires a collection method.');
  }

  return (
    <ScheduleStoreProvider
      mode="phlebotomy"
      initialCollectionMethod={redraw.collectionMethod}
    >
      <RedrawScheduleFlowContent
        redraw={redraw}
        onBack={onBack}
        onConfirm={onConfirm}
        isPending={isPending}
      />
    </ScheduleStoreProvider>
  );
};

const RedrawScheduleFlowContent = ({
  redraw,
  onBack,
  onConfirm,
  isPending,
}: RedrawScheduleFlowProps) => {
  const [step, setStep] = useState<ScheduleStep>('scheduler');
  const { collectionMethod, location, slot, tz } = useScheduleStore(
    (store) => store,
  );

  if (!collectionMethod) {
    throw new Error('Redraw scheduling requires a selected collection method.');
  }

  const canContinue = Boolean(location?.address && slot && tz);
  const instructions = getCollectionInstructions(collectionMethod);

  const handleBack = () => {
    if (step === 'summary') {
      setStep('scheduler');
      return;
    }

    onBack();
  };

  const handleConfirm = async () => {
    if (!location?.address || !slot || !tz) {
      return;
    }

    await onConfirm({
      timestamp: slot.start,
      timezone: tz,
      address: location.address,
    });
  };

  return (
    <>
      <div className="fixed left-0 top-0 z-20 hidden w-full px-10 py-2 md:flex md:h-14 md:items-center">
        <SuperpowerLogo className="h-4 w-[122px]" />
      </div>
      <div className="mx-auto flex w-full max-w-[656px] flex-1 flex-col space-y-8 px-6 py-8 md:my-auto md:flex-none md:px-16">
        <div className="relative z-[50] flex items-center justify-between gap-2">
          <Button
            type="button"
            variant="ghost"
            className="relative flex items-center gap-2 p-0"
            onClick={handleBack}
            disabled={isPending}
          >
            <ChevronLeft className="size-[18px] text-zinc-400" />
            <Body2 className="text-secondary">Back</Body2>
          </Button>
          <SuperpowerLogo className="md:hidden" />
        </div>

        {step === 'scheduler' ? (
          <div className="flex flex-1 flex-col justify-between">
            <div className="space-y-8">
              <div className="space-y-1">
                <H2>Select a time & location for your visit</H2>
                <Body1 className="text-zinc-500">{instructions}</Body1>
              </div>
              {collectionMethod === 'IN_LAB' ? <InLabScheduler /> : null}
              {collectionMethod === 'AT_HOME' ? <AtHomeScheduler /> : null}
            </div>

            <div className="flex items-center py-4 backdrop-blur-sm md:py-8">
              <div className="flex w-full flex-col-reverse justify-end gap-4 md:flex-row md:gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full bg-white"
                  onClick={onBack}
                  disabled={isPending}
                >
                  Back
                </Button>
                <Button
                  type="button"
                  className="w-full"
                  onClick={() => setStep('summary')}
                  disabled={!canContinue || isPending}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        {step === 'summary' ? (
          <div className="flex flex-1 flex-col justify-between">
            <div className="space-y-8">
              <div className="space-y-1">
                <H2>Confirm appointment</H2>
                <Body1 className="text-secondary">
                  Confirm your appointment details below.
                </Body1>
              </div>

              <RedrawSummaryCard redraw={redraw} />

              <AppointmentDetails
                collectionMethod={collectionMethod}
                slot={slot ?? undefined}
                timezone={tz ?? undefined}
                location={location}
              />
            </div>

            <div className="flex items-center py-4 backdrop-blur-sm md:py-8">
              <div className="flex w-full flex-col-reverse justify-end gap-4 md:flex-row md:gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full bg-white"
                  onClick={() => setStep('scheduler')}
                  disabled={isPending}
                >
                  Back
                </Button>
                <Button
                  type="button"
                  className="w-full"
                  onClick={() => {
                    void handleConfirm();
                  }}
                  disabled={!canContinue || isPending}
                >
                  {isPending ? (
                    <TransactionSpinner className="flex justify-center" />
                  ) : (
                    'Confirm'
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
};

const RedrawSummaryCard = ({
  redraw,
}: {
  redraw: Pick<MemberRedraw, 'serviceName' | 'serviceNames'>;
}) => {
  const serviceName =
    redraw.serviceName ?? redraw.serviceNames[0] ?? 'Superpower Blood Panel';

  return (
    <div className="flex flex-col rounded-[20px] border border-zinc-200 bg-white px-5 py-3 shadow shadow-black/[.03]">
      <div className="flex items-center gap-3">
        <img
          src={getServiceImage(serviceName)}
          alt={serviceName}
          className="size-16 rounded-xl object-cover object-center"
        />
        <div className="space-y-0.5">
          <Body1>{serviceName}</Body1>
          <Body2 className="line-clamp-3 text-zinc-400">
            Recollect your missing tests
          </Body2>
        </div>
      </div>
    </div>
  );
};
