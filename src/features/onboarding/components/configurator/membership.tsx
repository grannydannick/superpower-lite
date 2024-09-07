import { Dot } from 'lucide-react';

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Skeleton } from '@/components/ui/skeleton';
import { Body1, Body2, H2 } from '@/components/ui/typography';
import {
  MembershipType,
  useOnboarding,
} from '@/features/onboarding/stores/onboarding-store';
import { useMembershipPrice } from '@/features/settings/api';
import { formatMoney } from '@/utils/format-money';

const metadata = [
  'Full body blood test, results visualization and personalized protocol',
  '1:1 hour-long consult with longevity clinician',
  'Dedicated concierge team to support you with your protocol',
  'Sync all of your health data, trackers, and past health records',
  'Members only prices on 300+ products from our curated marketplace',
];

type Membership = {
  displayName: string;
  description?: string;
  type: MembershipType;
};

const memberships: Membership[] = [
  {
    displayName: 'Default',
    type: 'DEFAULT',
  },
];

const MembershipCard = ({ membership }: { membership: Membership }) => {
  // get membership price
  const code = localStorage.getItem('superpower-code');
  const membershipQuery = useMembershipPrice({
    code: code ?? undefined,
    queryConfig: {},
  });

  return (
    <div className="flex flex-row items-center rounded-xl border border-zinc-200 bg-zinc-50 p-4">
      <div className="flex w-full flex-row items-center justify-between">
        <div className="flex flex-row gap-x-4">
          <img
            src="/onboarding/membership.png"
            alt="Default"
            className="size-14 object-cover"
          />
          <div className="flex flex-col justify-center gap-1">
            <Body2 className="text-zinc-500">{membership.displayName}</Body2>
            <div className="flex items-center">
              <Body1 className="text-zinc-900 sm:text-base">
                {membershipQuery.data ? (
                  `${formatMoney(membershipQuery.data?.total / 12)}/mo`
                ) : (
                  <Skeleton className="h-6 w-[60px]" />
                )}
              </Body1>
              <Dot className="hidden text-zinc-400 sm:block" />
              <Body1 className="hidden text-zinc-400 sm:block sm:text-base">
                {membershipQuery.data ? (
                  `${formatMoney(membershipQuery.data.total)} billed annually`
                ) : (
                  <Skeleton className="h-6 w-[120px]" />
                )}
              </Body1>
            </div>
          </div>
        </div>

        <RadioGroupItem
          className="disabled:opacity-100"
          value={membership.type}
          disabled
        />
      </div>
    </div>
  );
};

const SectionMembership = () => {
  const { updateMembership, membership } = useOnboarding();

  return (
    <section id="plan" className="w-full max-w-[500px] space-y-6">
      <div className="space-y-2">
        <H2 className="text-zinc-900">Customize your membership</H2>
      </div>

      <div className="flex flex-col gap-2">
        <RadioGroup
          onValueChange={(value: MembershipType) => updateMembership(value)}
          defaultValue={membership ?? 'DEFAULT'}
        >
          {memberships.map((membership, index) => (
            <MembershipCard membership={membership} key={index} />
          ))}
        </RadioGroup>
        {metadata.map((meta, indx) => (
          <div className="flex items-center gap-1 sm:px-2" key={indx}>
            <div>
              <Dot color="#D4D4D8" />
            </div>
            <Body2 className="line-clamp-1 text-zinc-600">{meta}</Body2>
          </div>
        ))}
      </div>
    </section>
  );
};

export { SectionMembership };
