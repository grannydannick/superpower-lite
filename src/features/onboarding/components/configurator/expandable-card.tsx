import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TextShimmer } from '@/components/ui/text-shimmer';
import { Body1, Body2, H3, H4 } from '@/components/ui/typography';
import { useOnboarding } from '@/features/onboarding/stores/onboarding-store';
import { getDiscountedPrice } from '@/features/onboarding/utils/get-discounted-price';
import { useAvailableSubscriptions } from '@/features/settings/api/get-available-subscriptions';
import { useOutsideClick } from '@/hooks/use-outside-click';
import { formatMoney } from '@/utils/format-money';

const ExpandableCard = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const { processing, consentGiven, membershipType } = useOnboarding();

  const availableSubscriptionsQuery = useAvailableSubscriptions();

  const selectedSubscription = availableSubscriptionsQuery.data?.find(
    (as) => as.type === membershipType,
  );

  const annualTotal = selectedSubscription?.total ?? 0;

  const discount = getDiscountedPrice(selectedSubscription);

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
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="absolute inset-0 z-10 w-full bg-white/70"
          />
        )}
      </AnimatePresence>
      <div
        ref={ref}
        className="fixed bottom-7 z-50 w-[calc(100%-32px)] max-w-[535px] rounded-3xl border border-zinc-200 bg-zinc-900 shadow-2xl transition-all md:bottom-10 md:w-full"
      >
        <AnimatePresence>
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
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30,
                duration: 0.4,
              }}
              className="shrink-0 overflow-hidden"
            >
              <div className="flex flex-col gap-6 border-b border-b-zinc-700 p-6">
                <div className="flex w-full items-center justify-between">
                  <H3 className="text-white">Summary</H3>
                  <X
                    className="size-6 cursor-pointer text-zinc-400 transition-colors hover:text-zinc-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsExpanded((prev) => !prev);
                    }}
                  />
                </div>
                <div className="flex w-full items-center justify-between">
                  <Body1 className="text-white">Superpower Membership</Body1>
                  <Body1 className="text-zinc-400">
                    {availableSubscriptionsQuery.isLoading ? (
                      <Skeleton className="h-5 w-10" />
                    ) : (
                      formatMoney(selectedSubscription?.subtotal ?? 0)
                    )}
                  </Body1>
                </div>
                {discount ? (
                  <div className="flex w-full items-center justify-between">
                    <Body1 className="text-white">Applied discount</Body1>
                    <Body1 className="text-zinc-400">
                      {availableSubscriptionsQuery.isLoading ? (
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
        </AnimatePresence>
        <div className="flex w-full items-center justify-between px-6 py-4">
          <div>
            <div className="flex items-center gap-2">
              <Body1 className="text-white sm:hidden">
                {formatMoney(annualTotal / 12)}/mo
              </Body1>

              <H4 className="hidden text-white sm:block">My membership</H4>
              <H4 className="hidden text-zinc-400 sm:block">
                {formatMoney(annualTotal)}/yr
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
              <Body2 className="cursor-pointer text-zinc-400 hover:text-vermillion-900">
                View Details
              </Body2>
            </button>
          </div>
          <Button
            className="rounded-lg border border-zinc-500 bg-zinc-700 px-6 py-4"
            disabled={
              availableSubscriptionsQuery.isLoading ||
              processing ||
              !consentGiven
            }
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
      </div>
    </>
  );
};

export { ExpandableCard };
