import React from 'react';

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Body1, Body2, H2 } from '@/components/ui/typography';
import {
  BloodPackageType,
  useOnboarding,
} from '@/features/onboarding/stores/onboarding-store';
import { cn } from '@/lib/utils';

type Package = {
  displayName: string;
  description: string;
  price: number;
  type: BloodPackageType;
};

const packages: Package[] = [
  // superpower blood panel service
  {
    displayName: 'Baseline',
    description: '65 biomarkers',
    price: 0,
    type: 'BASELINE',
  },
  // advanced blood panel service
  // {
  //   displayName: 'Advanced',
  //   description: '85 biomarkers',
  //   price: 199,
  //   type: 'ADVANCED',
  // },
];

interface BloodTestPackageCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  bloodPackage: Package;
  selected: boolean;
}

const BloodTestPackageCard: React.FC<BloodTestPackageCardProps> = ({
  bloodPackage,
  selected,
  ...rest
}) => {
  return (
    <div
      className={cn(
        'flex flex-row items-center rounded-xl border border-zinc-200 p-4 sm:px-6 sm:py-5',
        selected ? 'bg-zinc-50' : null,
      )}
      {...rest}
    >
      <div className="flex w-full flex-row items-center justify-between">
        <div className="flex flex-row gap-x-4">
          <div>
            <div className="flex gap-1.5">
              <Body1 className="text-zinc-900">
                {bloodPackage.displayName}
              </Body1>
              {bloodPackage.type === 'ADVANCED' && (
                <div className="rounded-[6px] bg-[#FFEDD5] px-2 py-1 text-[11px] text-[#FC5F2B] sm:text-xs">
                  Most popular
                </div>
              )}
            </div>

            <Body2 className="text-zinc-500">{bloodPackage.description}</Body2>
          </div>
        </div>
        <div className="flex flex-row items-center gap-x-6">
          <Body2 className="text-zinc-500">
            {bloodPackage.price === 0 ? 'Included' : `+$${bloodPackage.price}`}
          </Body2>

          <RadioGroupItem value={bloodPackage.type} />
        </div>
      </div>
    </div>
  );
};

const SectionPackages = () => {
  const { bloodPackage, updateBloodPackage } = useOnboarding();
  return (
    <section id="package" className="w-full space-y-6">
      <div className="space-y-2">
        <H2 className="text-[#1E1E1E]">Customize your membership</H2>
        <p className="text-base text-zinc-500">
          Choose the blood test package would like as part of your membership.
        </p>
        {/*TODO: uncomment when advanced panel is back*/}
        {/*<a*/}
        {/*  href="https://superpower.com/biomarkers"*/}
        {/*  target="blank"*/}
        {/*  rel="noreferrer"*/}
        {/*  className="flex flex-row items-center space-x-1 text-[#FC5F2B]"*/}
        {/*>*/}
        {/*  <span>Compare and view tests</span>*/}
        {/*  <ArrowUpRight className="size-4" />*/}
        {/*</a>*/}
      </div>
      <div className="space-y-2">
        <RadioGroup value={bloodPackage ?? 'BASELINE'}>
          {packages.map((bp, i) => (
            <BloodTestPackageCard
              key={i}
              bloodPackage={bp}
              selected={bp.type === bloodPackage}
              onClick={() => updateBloodPackage(bp.type)}
            />
          ))}
        </RadioGroup>
      </div>
    </section>
  );
};

export { SectionPackages };
