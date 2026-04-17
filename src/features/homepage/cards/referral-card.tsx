import { useQuery } from '@tanstack/react-query';
import { m } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

import { Link } from '@/components/ui/link';
import { Body1, Body2 } from '@/components/ui/typography';
import { familyRiskPlanQuery } from '@/features/homepage/api/queries';
import { FamilyInsightsBanner } from '@/features/homepage/components/family-insights-banner';
import { FamilyRiskBanner } from '@/features/homepage/components/family-risk-banner';

import { HomepageCard } from '../components/homepage-card';

export const LiveBetterTogetherCard: React.FC = () => {
  const familyRiskPlanQueryResult = useQuery(familyRiskPlanQuery());
  const familyRiskPlan = familyRiskPlanQueryResult.data;
  const hasFamilyRiskPlan = (familyRiskPlan?.risks?.length ?? 0) > 0;

  return (
    <HomepageCard title="Live better, together">
      <div className="flex flex-col gap-3">
        {familyRiskPlanQueryResult.isPending ? (
          <div className="space-y-3 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="h-6 w-40 animate-pulse rounded bg-zinc-200" />
            <div className="h-4 w-64 animate-pulse rounded bg-zinc-200" />
            <div className="h-4 w-56 animate-pulse rounded bg-zinc-200" />
          </div>
        ) : familyRiskPlanQueryResult.isError ? null : hasFamilyRiskPlan ? (
          <FamilyRiskBanner />
        ) : (
          <FamilyInsightsBanner />
        )}
        <ReferAndEarnLink />
      </div>
    </HomepageCard>
  );
};

const ReferAndEarnLink = () => (
  <div className="group relative cursor-pointer overflow-hidden rounded-3xl">
    <Link
      to="/invite"
      className="relative flex items-center justify-between bg-zinc-900 pr-6"
    >
      <div className="absolute -left-12 top-0 h-full overflow-hidden md:inset-0">
        <m.img
          src="/home/refer-a-friend.webp"
          alt="Refer a friend illustration"
          className="pointer-events-none h-full w-auto select-none object-contain object-left md:size-full md:object-left-top"
          loading="lazy"
          decoding="async"
          initial={{ y: 12 }}
          animate={{ y: 0 }}
          transition={{
            type: 'spring',
            stiffness: 220,
            damping: 20,
            mass: 0.9,
          }}
        />
      </div>
      <div className="relative z-10 flex items-center gap-4">
        <div className="size-20 lg:w-28 xl:w-36" />
        <div className="md:py-6">
          <Body2 className="line-clamp-1 text-zinc-400">
            Give the gift of health.
          </Body2>
          <Body1 className="hidden text-white md:block">
            Refer your friends and earn $50
          </Body1>
          <Body1 className="block text-white md:hidden">
            Refer friends and earn $50
          </Body1>
        </div>
      </div>

      <ChevronRight className="size-5 text-white transition-all group-hover:-mr-1" />
    </Link>
  </div>
);
