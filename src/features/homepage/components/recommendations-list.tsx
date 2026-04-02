import { Link } from '@tanstack/react-router';
import { m } from 'framer-motion';
import {
  ActivityIcon,
  ChevronRightIcon,
  CreditCardIcon,
  DollarSignIcon,
} from 'lucide-react';
import { useMemo } from 'react';

import { Body1, Body2 } from '@/components/ui/typography';
import {
  useRecommendations,
  Recommendation,
} from '@/features/homepage/api/get-recommendations';
import { useProtocols } from '@/features/protocol/api';
import { useAnalytics } from '@/hooks/use-analytics';
import { useUser } from '@/lib/auth';

export const RecommendationsList: React.FC = () => {
  const { data: recommendations, isLoading } = useRecommendations();
  const { data: protocols } = useProtocols();
  const userQuery = useUser();
  const hasRxAccess =
    userQuery.isFetched && userQuery.data?.access?.rx !== false;

  const hasCompletedPlans = useMemo(
    () => protocols?.some((p) => p.status === 'completed'),
    [protocols],
  );

  if (isLoading || !userQuery.isFetched || hasCompletedPlans || !hasRxAccess) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="space-y-4">
        <RecommendationCard recommendation={recommendations?.[0]} />
      </div>
    </div>
  );
};

export const RecommendationCard: React.FC<{
  recommendation?: Recommendation;
}> = ({ recommendation }) => {
  const { track } = useAnalytics();
  const heading = recommendation?.name
    ? `You mentioned that you're prescribed ${recommendation?.name}`
    : `Superpower for Rx`;
  const description = recommendation?.name
    ? `Manage your prescription with Superpower`
    : `Manage your medications with Superpower`;

  const handleClick = (link: string) => {
    track('recommendation_card_clicked', {
      recommendationId: recommendation?.id,
      recommendationName: recommendation?.name,
      link,
      hasRecommendation: !!recommendation,
    });
  };

  const content = (
    <div className="group relative flex cursor-pointer justify-between gap-4 rounded-3xl bg-white px-5 py-4 shadow-sm shadow-black/[.04]">
      <div className="relative my-auto size-24 shrink-0">
        <m.img
          src="/home/rx.webp"
          alt={recommendation?.name}
          className="pointer-events-none absolute bottom-0 size-full select-none object-cover object-top px-2 pt-5"
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
      <div className="w-full py-5 pr-2">
        <Body2 className="text-zinc-500"> {heading}</Body2>
        <Body1 className="mt-1 text-zinc-900">{description}</Body1>
        <div className="mt-4 flex w-full flex-row flex-wrap gap-x-4 gap-y-2">
          <div className="flex items-center gap-1">
            <DollarSignIcon className="size-4 shrink-0 text-zinc-500" />
            <Body2 className="text-wrap leading-none text-zinc-500">
              Members-only pricing
            </Body2>
          </div>
          <div className="flex items-center gap-1">
            <CreditCardIcon className="size-4 shrink-0 text-zinc-500" />
            <Body2 className="text-wrap leading-none text-zinc-500">
              No payment until approved
            </Body2>
          </div>
          <div className="flex items-center gap-1">
            <ActivityIcon className="size-4 shrink-0 text-zinc-500" />
            <Body2 className="text-wrap leading-none text-zinc-500">
              Ongoing testing to manage & track progress
            </Body2>
          </div>
        </div>
      </div>
      <div className="hidden flex-col justify-center py-5 md:flex">
        <ChevronRightIcon className="size-5 text-zinc-500 transition-all group-hover:-mr-1" />
      </div>
    </div>
  );

  if (recommendation) {
    const link = `/prescriptions/${recommendation.id}`;
    return (
      <Link
        to="/prescriptions/$id"
        params={{ id: recommendation.id }}
        onClick={() => handleClick(link)}
      >
        {content}
      </Link>
    );
  }

  return (
    <Link
      to="/marketplace"
      search={{ tab: 'prescriptions' }}
      onClick={() => handleClick('/marketplace?tab=prescriptions')}
    >
      {content}
    </Link>
  );
};
