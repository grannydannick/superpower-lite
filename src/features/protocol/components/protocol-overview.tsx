import moment from 'moment';
import { useParams, useSearchParams } from 'react-router-dom';

import { ChevronLeft } from '@/components/icons/chevron-left-icon';
import { Link } from '@/components/ui/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Body2, H3 } from '@/components/ui/typography';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';

import { Protocol, useLatestProtocol, useProtocol, useProtocols } from '../api';
import { getGoalImage } from '../utils/get-goal-image';

import { ProtocolGoalCard } from './goals/protocol-goal-card';
import { ProtocolTabs } from './overview/protocol-tabs';
import { ProtocolWaitingScreen } from './protocol-waiting-screen';

export const ProtocolOverview = ({
  protocolId,
}: {
  protocolId?: Protocol['id'];
}) => {
  const { id } = useParams();
  const {
    data: lastProtocol,
    isLoading: isLatestProtocolLoading,
    error: latestProtocolError,
  } = useLatestProtocol();

  const {
    data: idProtocol,
    isLoading: isProtocolLoading,
    error: protocolError,
  } = useProtocol(protocolId!);

  const { data: allProtocols } = useProtocols();

  const { width } = useWindowDimensions();
  const isMobile = width ? width < 1024 : false;
  const [searchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'protocol';

  const protocol = protocolId ? idProtocol : lastProtocol;
  const isLoading = protocolId ? isProtocolLoading : isLatestProtocolLoading;
  const error = protocolId ? protocolError : latestProtocolError;

  const historicalProtocols =
    allProtocols?.filter((p) => p.id !== protocol?.id) || [];

  const name = id && protocol ? protocol?.title : 'Protocol';

  if (isLoading) {
    return (
      <>
        <div className="mx-auto h-screen w-full max-w-[1600px] grid-cols-5 gap-8 p-6 lg:grid lg:px-16">
          <div className="col-span-3 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4 lg:hidden">
                <Skeleton className="h-8 w-24 rounded-xl" />
                <Skeleton className="h-8 w-24 rounded-xl" />
              </div>

              <div className="flex items-center gap-4 lg:hidden">
                <Skeleton className="h-8 w-24 rounded-xl" />
                <Skeleton className="h-8 w-24 rounded-xl" />
              </div>
            </div>
            <Skeleton className="h-12 w-3/4 rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
          <div className="col-span-2 hidden space-y-6 lg:block">
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        </div>
      </>
    );
  }

  if (!protocol) {
    return (
      <div className="mx-auto w-full max-w-[1600px] space-y-4 p-6 lg:px-16">
        <H3 className="text-black">Protocol</H3>
        <ProtocolWaitingScreen />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <Body2 className="text-red-600">
          Failed to load protocol. Please try again later.
        </Body2>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4 p-6 lg:px-16">
      {id && (
        <Link
          to="/protocol"
          className="group -ml-1.5 flex items-center gap-0.5 p-0"
        >
          <ChevronLeft className="-mt-px w-[15px] text-zinc-400 transition-all duration-150 group-hover:-translate-x-0.5 group-hover:text-zinc-600" />
          <Body2 className="text-zinc-500 transition-all duration-150 group-hover:text-zinc-700">
            Overview
          </Body2>
        </Link>
      )}
      <div className="relative z-30 mb-4 flex w-full items-center justify-between gap-8 lg:hidden">
        <div className="flex gap-4">
          <Link to={`?tab=protocol`}>
            <H3
              className={
                currentTab === 'protocol'
                  ? 'text-black'
                  : 'text-black/20 transition-all hover:text-black/40'
              }
            >
              {name}
            </H3>
          </Link>
          <Link to={`?tab=goals`}>
            <H3
              className={
                currentTab === 'goals'
                  ? 'text-black'
                  : 'text-black/20 transition-all hover:text-black/40'
              }
            >
              Goals
            </H3>
          </Link>
        </div>
        {id && (
          <Body2 className="text-secondary">
            {moment(protocol.created).format('MMMM DD, YYYY')}
          </Body2>
        )}
      </div>
      <div className="grid-cols-5 gap-8 lg:grid">
        <div
          className={`col-span-3 space-y-4 ${isMobile && currentTab === 'goals' ? 'hidden' : ''}`}
        >
          <div className="hidden w-full items-center justify-between gap-4 lg:flex">
            <H3>{name}</H3>
            {id && (
              <Body2 className="text-secondary">
                {moment(protocol.created).format('MMMM DD, YYYY')}
              </Body2>
            )}
          </div>
          <ProtocolTabs
            protocol={protocol}
            historicalProtocols={id ? undefined : historicalProtocols}
          />
        </div>
        <div
          className={`col-span-2 space-y-4 ${isMobile ? (currentTab === 'goals' ? 'block' : 'hidden') : 'hidden lg:block'}`}
        >
          <H3 className="hidden lg:block">Goals</H3>
          {protocol.goals.length > 0 && (
            <div className="flex flex-col gap-4">
              {protocol.goals.map((goal, index) => (
                <ProtocolGoalCard
                  key={goal.id}
                  goal={goal}
                  protocol={protocol}
                  src={getGoalImage(index)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
