import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import React, {
  Dispatch,
  RefObject,
  SetStateAction,
  useEffect,
  useRef,
} from 'react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Body1, Body2, Body3, H3, H4 } from '@/components/ui/typography';
import { GRAIL_GALLERI_MULTI_CANCER_TEST } from '@/const';
import { useOnboarding } from '@/features/onboarding/stores/onboarding-store';
import { useService } from '@/features/services/api';
import { useMembershipPrice } from '@/features/settings/api';
import { useOutsideClick } from '@/hooks/use-outside-click';
import { useStepper } from '@/lib/stepper';
import { cn } from '@/lib/utils';
import { HealthcareService } from '@/types/api';
import { formatMoney } from '@/utils/format-money';

type Props = {
  parentRef: RefObject<HTMLDivElement>;
  isExpanded: boolean;
  setIsExpanded: Dispatch<SetStateAction<boolean>>;
};

const ServiceLine = ({ service }: { service: HealthcareService }) => {
  const serviceQuery = useService({
    serviceId: service.id,
    method: service.name === GRAIL_GALLERI_MULTI_CANCER_TEST ? 'AT_HOME' : null,
  });

  return (
    <div className="flex w-full items-center justify-between">
      <Body1 className="text-white">{service.name}</Body1>
      <Body1 className="text-zinc-400">
        {serviceQuery.data ? (
          formatMoney(serviceQuery.data.service.price)
        ) : (
          <Skeleton className="h-6 w-10" />
        )}
      </Body1>
    </div>
  );
};

const ExpandableCard = ({ parentRef, isExpanded, setIsExpanded }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const code = localStorage.getItem('superpower-code');

  const membershipQuery = useMembershipPrice({
    code: code ?? undefined,
    queryConfig: {},
  });

  const { collectionMethod, additionalServices } = useOnboarding();

  const annualTotal = membershipQuery.data?.total ?? 0;

  const { nextOnboardingStep } = useStepper((s) => s);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsExpanded(false);
      }
    }

    if (isExpanded) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isExpanded]);

  useOutsideClick(ref, () => setIsExpanded(false));

  return (
    <>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 w-full bg-white/70"
            style={{ height: parentRef.current?.scrollHeight ?? 0 }}
          />
        )}
      </AnimatePresence>
      <motion.div
        initial={false}
        ref={ref}
        animate={{
          height: isExpanded ? 294 : 92,
        }}
        onClick={() => setIsExpanded(true)}
        className="fixed bottom-0 z-50 mb-9 flex flex-col overflow-y-auto rounded-3xl border border-zinc-200 bg-zinc-900 shadow-[0_10px_100px_0px_rgba(24,24,27,0.15)] scrollbar-none"
      >
        {isExpanded ? (
          <motion.div
            initial={{
              height: 0,
              opacity: 0,
            }}
            animate={{
              height: 'auto',
              opacity: 1,
            }}
            exit={{
              height: 0,
              opacity: 0,
            }}
          >
            <div className="flex flex-col gap-6 border-b border-b-zinc-700 p-6">
              <div className="flex w-full items-center justify-between">
                <H3 className="text-white">Summary</H3>
                <X
                  className="size-6 cursor-pointer text-zinc-400"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded((prev) => !prev);
                  }}
                />
              </div>
              <div className="flex w-full items-center justify-between">
                <Body1 className="text-white">Superpower Membership</Body1>
                <Body1 className="text-zinc-400">
                  {membershipQuery.isLoading ? (
                    <Skeleton className="h-5 w-10" />
                  ) : (
                    formatMoney(membershipQuery.data?.total ?? 0)
                  )}
                </Body1>
              </div>
              {collectionMethod === 'AT_HOME' ? (
                <div className="flex w-full items-center justify-between">
                  <Body1 className="text-white">At-home collection</Body1>
                  {/*we probably SHOULD create endpoint to expose at-home price to make this dynamic*/}
                  <Body1 className="text-zinc-400">{formatMoney(7900)}</Body1>
                </div>
              ) : null}
              {/*{bloodPackage === 'ADVANCED' ? (*/}
              {/*  <div className="flex w-full items-center justify-between">*/}
              {/*    <Body1 className="text-white">Advanced blood package</Body1>*/}
              {/*    <Body1 className="text-zinc-400">{get advanced panel service price here}</Body1>*/}
              {/*  </div>*/}
              {/*) : null}*/}
              {additionalServices.map((as, index) => (
                <ServiceLine service={as} key={index} />
              ))}
            </div>
            <div className="flex flex-col border-b border-b-zinc-700 px-6 py-4">
              <div className="flex w-full justify-between">
                <Body1 className="text-white">Annual Total</Body1>
                <div className="flex flex-col items-end">
                  <Body1 className="text-white">
                    {formatMoney(annualTotal)}
                  </Body1>
                  <Body2 className="text-zinc-400">
                    {formatMoney(annualTotal)}/mo
                  </Body2>
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}
        <div
          className={cn(
            'flex items-center justify-between px-6 py-4 w-[355px] md:w-[435px] xl:w-[535px]',
            isExpanded && 'rounded-t-none',
          )}
        >
          <div>
            <div className="flex gap-2">
              <H4 className="text-white">My plan</H4>
              <H4 className="text-zinc-400">
                {formatMoney(annualTotal / 12)}/mo
              </H4>
            </div>
            <button
              type="button"
              className="w-fit"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded((prev) => !prev);
              }}
            >
              <Body3 className="cursor-pointer text-zinc-400 hover:text-[#FC5F2B]">
                View Details
              </Body3>
            </button>
          </div>
          <Button
            className="rounded-[12px] border border-zinc-500 bg-zinc-700 px-6 py-4"
            disabled={annualTotal === 0}
            onClick={async (e) => {
              e.stopPropagation();

              await nextOnboardingStep();
            }}
          >
            Checkout
          </Button>
        </div>
      </motion.div>
    </>
  );
};

export { ExpandableCard };
