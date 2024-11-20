import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import React, { Dispatch, SetStateAction, useEffect, useRef } from 'react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TextShimmer } from '@/components/ui/text-shimmer';
import { Body1, Body2, H3, H4 } from '@/components/ui/typography';
import { useOnboarding } from '@/features/onboarding/stores/onboarding-store';
import { getDiscountedPrice } from '@/features/onboarding/utils/get-discounted-price';
import { useMembershipPrice } from '@/features/settings/api';
import { useOutsideClick } from '@/hooks/use-outside-click';
import { cn } from '@/lib/utils';
import { formatMoney } from '@/utils/format-money';

type Props = {
  isExpanded: boolean;
  setIsExpanded: Dispatch<SetStateAction<boolean>>;
};

const ExpandableCard = ({ isExpanded, setIsExpanded }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const code = localStorage.getItem('superpower-code');

  const membershipQuery = useMembershipPrice({
    code: code ?? undefined,
    queryConfig: {},
  });

  const { processing, consentGiven } = useOnboarding();

  const annualTotal = membershipQuery.data?.total ?? 0;

  const discount = getDiscountedPrice(membershipQuery.data);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsExpanded(false);
      }
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
          />
        )}
      </AnimatePresence>
      <motion.div
        initial={false}
        ref={ref}
        animate={{
          height: isExpanded ? 294 : 92,
        }}
        className="fixed bottom-7 z-50 flex w-[calc(100%-32px)] max-w-[535px] flex-col overflow-y-auto rounded-3xl border border-zinc-200 bg-zinc-900 shadow-2xl md:bottom-10 md:w-full"
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
              {discount ? (
                <div className="flex w-full items-center justify-between">
                  <Body1 className="text-white">Applied discount</Body1>
                  <Body1 className="text-zinc-400">
                    {membershipQuery.isLoading ? (
                      <Skeleton className="h-5 w-10" />
                    ) : (
                      discount
                    )}
                  </Body1>
                </div>
              ) : null}
            </div>
            <div className="flex flex-col border-b border-b-zinc-700 px-6 py-4">
              <div className="flex w-full justify-between">
                <Body1 className="text-white">Annual Total</Body1>
                <div className="flex flex-col items-end">
                  <Body1 className="text-white">
                    {formatMoney(annualTotal)}
                  </Body1>
                  <Body2 className="text-zinc-400">
                    {formatMoney(annualTotal / 12)}/mo
                  </Body2>
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}
        <div
          className={cn(
            'flex items-center justify-between px-6 py-4 w-full',
            isExpanded && 'rounded-t-none',
          )}
        >
          <div>
            <div className="flex items-center gap-2">
              <Body1 className="text-white sm:hidden">
                {formatMoney(annualTotal / 12)}/mo
              </Body1>

              <H4 className="hidden text-white sm:block">My membership</H4>
              <H4 className="hidden text-zinc-400 sm:block">
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
              <Body2 className="cursor-pointer text-zinc-400 hover:text-[#FC5F2B]">
                View Details
              </Body2>
            </button>
          </div>
          <Button
            className="rounded-[12px] border border-zinc-500 bg-zinc-700 px-6 py-4"
            disabled={membershipQuery.isLoading || processing || !consentGiven}
            type="submit"
            form="billingForm"
            onClick={async (e) => {
              e.stopPropagation();
            }}
          >
            {processing ? (
              <TextShimmer
                className="line-clamp-1 text-base [--base-color:white] [--base-gradient-color:#a1a1aa]"
                duration={1}
              >
                Confirming…
              </TextShimmer>
            ) : (
              'Checkout'
            )}
          </Button>
        </div>
      </motion.div>
    </>
  );
};

export { ExpandableCard };
