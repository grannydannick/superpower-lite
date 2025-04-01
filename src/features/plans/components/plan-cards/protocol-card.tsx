import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import { LockIcon } from '@/components/icons';
import { ArrowTopRight } from '@/components/icons/arrow-top-right-icon';
import { Button } from '@/components/ui/button';
import { H4, Body2 } from '@/components/ui/typography';
import { usePlans } from '@/features/plans/api/get-plans';
import { cn } from '@/lib/utils';

const getTimestamp = (plan: { created?: string }) =>
  plan.created ? new Date(plan.created).getTime() : 0;

export const ProtocolCard = ({ onClick }: { onClick?: () => void }) => {
  const navigate = useNavigate();

  const getPlansQuery = usePlans({});

  let latestAvailablePlan = getPlansQuery.data?.actionPlans
    ? getPlansQuery.data.actionPlans.sort(
        (a, b) => getTimestamp(b) - getTimestamp(a),
      )?.[0]
    : undefined;

  // note this logic here checks if latest plan is published
  latestAvailablePlan =
    latestAvailablePlan && latestAvailablePlan.status === 'completed'
      ? latestAvailablePlan
      : undefined;

  const handleClick = () => {
    onClick ? onClick() : undefined;
    navigate(`/plans/${latestAvailablePlan?.id}`);
  };

  return (
    <div
      className={cn(
        'group flex h-56 w-full flex-col transition-all duration-300 justify-between outline-transparent focus:outline-1 focus:outline-white/20 overflow-hidden rounded-2xl border border-white/10 bg-zinc-400/30 p-4 backdrop-blur-xl hover:border-white/20 hover:bg-zinc-400/40',
        latestAvailablePlan ? 'cursor-pointer' : undefined,
        getPlansQuery.isLoading ? 'opacity-50 animate-pulse' : undefined,
      )}
      onClick={latestAvailablePlan ? handleClick : undefined}
      role="presentation"
    >
      <div className="flex h-full flex-col justify-start transition-opacity duration-500">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex size-full flex-col"
        >
          <div className="flex w-full justify-between gap-4">
            <H4 className="text-white">Your Protocol</H4>
            {latestAvailablePlan ? (
              <ArrowTopRight className="absolute right-5 top-5 text-white/50 transition-all duration-200 group-hover:right-4 group-hover:top-4 group-hover:text-white/75" />
            ) : (
              <LockIcon
                fill="currentColor"
                className="absolute right-5 top-5 w-5 text-white/50"
              />
            )}
          </div>
          <div className="flex h-full flex-col justify-between">
            <div className="relative h-full">
              <Body2 className="mt-2 line-clamp-5 bg-gradient-to-b from-white/75 to-white/10 bg-clip-text text-transparent">
                {latestAvailablePlan?.description}
              </Body2>
              {!latestAvailablePlan ? (
                <div className="absolute inset-0 z-20 mb-2 flex items-center justify-center">
                  <Body2 className="relative z-10 rounded-full border border-white/5 bg-white/25 px-4 py-2 text-white backdrop-blur-2xl">
                    <LockIcon
                      fill="currentColor"
                      className="mr-2 inline-block w-4"
                    />
                    Protocol coming soon
                  </Body2>
                </div>
              ) : null}
            </div>
            <div className="flex w-full items-end justify-between gap-4">
              <Body2 className="text-white">
                {latestAvailablePlan
                  ? 'Access your latest plan'
                  : 'Awaiting lab results'}
              </Body2>
              {latestAvailablePlan ? (
                <div className="md:hidden">
                  <Button
                    type="button"
                    variant="white"
                    size="medium"
                    onClick={() => onClick?.()}
                    className="border border-primary/10"
                  >
                    More info
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
