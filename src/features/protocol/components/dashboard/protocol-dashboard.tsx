import { useParams } from '@tanstack/react-router';

import { ChevronLeft } from '@/components/icons/chevron-left-icon';
import { Link } from '@/components/ui/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Body2, H3, H4 } from '@/components/ui/typography';
import { AiSuggestions } from '@/features/messages/components/ai-suggestions';

import {
  Protocol,
  ProtocolAction,
  ProtocolGoal,
  useLatestProtocol,
  useLegacyProtocols,
  useProtocol,
  useProtocols,
} from '../../api';
import { ProtocolWaitingScreen } from '../protocol-waiting-screen';

import { ConsiderAdding } from './consider-adding';
import { Goals } from './goals';
import { PastProtocols, type PastProtocolItem } from './past-protocols';
import { TodaysList } from './todays-list';

function getAllActions(goals: ProtocolGoal[]): ProtocolAction[] {
  return goals.flatMap((goal) =>
    [goal.primaryAction, ...(goal.additionalActions || [])].filter(Boolean),
  );
}

/**
 * Extract "today's actions" from protocol goals
 * Returns accepted lifestyle/nutrition actions and accepted supplements
 */
function getTodaysActions(goals: ProtocolGoal[]): ProtocolAction[] {
  return getAllActions(goals).filter((action) => {
    if (action.accepted !== true) return false;
    if (
      action.content.type === 'supplement' ||
      action.content.type === 'lifestyle'
    )
      return true;

    return false;
  });
}

function getNonAcceptedActions(goals: ProtocolGoal[]): ProtocolAction[] {
  return getAllActions(goals).filter((action) => action.accepted !== true);
}

export const ProtocolDashboard = ({
  protocolId,
}: {
  protocolId?: Protocol['id'];
}) => {
  const id = useParams({
    select: ({ id }) => id,
    strict: false,
  });
  const {
    data: latestData,
    isLoading: isLatestProtocolLoading,
    error: latestProtocolError,
  } = useLatestProtocol();

  const {
    data: idProtocolData,
    isLoading: isProtocolLoading,
    error: protocolError,
  } = useProtocol(protocolId);

  const { data: allProtocols } = useProtocols();
  const { data: allLegacyProtocols } = useLegacyProtocols();

  // Unwrap the protocol from the response
  const lastProtocol = latestData?.protocol;
  const idProtocol = idProtocolData?.protocol;

  const protocol = protocolId ? idProtocol : lastProtocol;
  const isLoading = protocolId ? isProtocolLoading : isLatestProtocolLoading;
  const error = protocolId ? protocolError : latestProtocolError;

  const sp2Historical: PastProtocolItem[] =
    allProtocols
      ?.filter((p) => p.id !== protocol?.id)
      .map((p) => ({ id: p.id, date: p.createdAt, type: 'sp2' as const })) ||
    [];

  const legacyHistorical: PastProtocolItem[] =
    allLegacyProtocols?.map((p) => ({
      id: p.id,
      date: p.created,
      type: 'legacy' as const,
    })) || [];

  const historicalProtocols = [...sp2Historical, ...legacyHistorical].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  if (isLoading) {
    return (
      <div className="mx-auto h-screen w-full max-w-[800px] space-y-6 p-6 lg:px-16">
        <Skeleton className="h-8 w-32 rounded-xl" />
        <Skeleton className="h-12 w-48 rounded-2xl" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="size-6 rounded-[6px]" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-16 w-full rounded-2xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!protocol) {
    return <ProtocolWaitingScreen />;
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

  // Extract lifestyle/nutrition actions from goals for "Today's actions"
  const todaysActions = getTodaysActions(protocol.goals);
  const nonAcceptedActions = getNonAcceptedActions(protocol.goals);

  return (
    <div className="mx-auto w-full max-w-[800px] space-y-8 p-6 pb-24 lg:px-16">
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
      <H3>Protocol</H3>
      <TodaysList actions={todaysActions} />
      <Goals goals={protocol.goals} protocolId={protocol.id} />
      {nonAcceptedActions.length > 0 && (
        <ConsiderAdding protocolId={protocol.id} actions={nonAcceptedActions} />
      )}
      <PastProtocols protocols={historicalProtocols} />
      <div className="space-y-4">
        <H4>Ask Superpower AI</H4>
        <AiSuggestions
          context="I'm looking at my SP2 Protocol dashboard page with today's actions, goals, and recommendations. Please give me some suggestions for questions I can ask about my protocol and health journey."
          showAskOwn
        />
      </div>
    </div>
  );
};
