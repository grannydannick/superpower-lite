import { ArrowUpRight } from 'lucide-react';
import React from 'react';

import { Body2, H2 } from '@/components/ui/typography';
import { useOnboarding } from '@/features/onboarding/stores/onboarding-store';
import { getTotalPrice } from '@/features/onboarding/utils/get-total-price';
import { useMembershipPrice } from '@/features/settings/api';
import { HealthcareService } from '@/types/api';
import { formatMoney } from '@/utils/format-money';

const ServiceLine = ({ service }: { service: HealthcareService }) => {
  return (
    <div className="flex justify-between">
      <div className="flex gap-1">
        <Body2 className="text-zinc-900">{service.name}</Body2>
        {/*<Body2 className="text-zinc-400">(Annual)</Body2>*/}
      </div>
      <Body2 className="text-zinc-400">{formatMoney(service.price)}</Body2>
    </div>
  );
};

const Summary = () => {
  const { additionalServices, collectionMethod, bloodPackage } =
    useOnboarding();

  const code = localStorage.getItem('superpower-code');
  const membershipQuery = useMembershipPrice({
    code: code ?? undefined,
    queryConfig: {},
  });

  const total = getTotalPrice(
    collectionMethod ?? 'IN_LAB',
    additionalServices,
    membershipQuery.data?.total,
  );

  return (
    <section id="summary" className="w-full max-w-[500px] space-y-6">
      <H2 className="text-zinc-900">Summary</H2>
      <div className="rounded-[20px] border border-zinc-200">
        <div className="space-y-2 border-b border-zinc-200 p-6">
          <div className="flex justify-between">
            <div className="flex gap-1">
              <Body2 className="line-clamp-1 text-zinc-900">
                Superpower Membership
              </Body2>
              <Body2 className="text-zinc-400">(Annual)</Body2>
            </div>
            <Body2 className="text-zinc-400">{formatMoney(49900)}</Body2>
          </div>
          {collectionMethod === 'AT_HOME' ? (
            <div className="flex justify-between">
              <div className="flex gap-1">
                <Body2 className="line-clamp-1 text-zinc-900">
                  At-home collection
                </Body2>
              </div>
              <Body2 className="text-zinc-400">{formatMoney(7900)}</Body2>
            </div>
          ) : null}
          {bloodPackage === 'ADVANCED' ? (
            <div className="flex justify-between">
              <div className="flex gap-1">
                <Body2 className="line-clamp-1 text-zinc-900">
                  Advanced blood package
                </Body2>
                <Body2 className="text-zinc-400">(Annual)</Body2>
              </div>
              <Body2 className="text-zinc-400">{formatMoney(19900)}</Body2>
            </div>
          ) : null}
          {additionalServices.map((as, index) => (
            <ServiceLine service={as} key={index} />
          ))}
        </div>
        <div className="flex justify-between p-6">
          <Body2 className="text-zinc-900">Annual Total</Body2>
          <div className="flex flex-col items-end">
            <Body2 className="text-zinc-900">{formatMoney(total)}</Body2>
            <Body2 className="text-zinc-400">
              {formatMoney(total / 12)}/mo
            </Body2>
          </div>
        </div>
      </div>
      <div className="flex flex-row items-center gap-1">
        <Body2 className="text-xs text-zinc-500 sm:text-sm">
          HSA/FSA eligible with
        </Body2>
        <img
          src="/onboarding/truemed.png"
          alt="truemed"
          className="h-auto w-[60px] object-contain sm:w-[70px]"
        />
        <a
          href="https://www.truemed.com/about"
          target="_blank"
          rel="noreferrer"
          className="flex flex-row items-center space-x-1 text-xs  text-[#FC5F2B] sm:text-sm"
        >
          <span>Learn more</span>
          <ArrowUpRight className="size-4" />
        </a>
      </div>
    </section>
  );
};

export { Summary };
