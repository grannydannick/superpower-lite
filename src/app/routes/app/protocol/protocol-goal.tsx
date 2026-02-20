import { useParams } from 'react-router';

import { Head } from '@/components/seo/head';
import { ProtocolGoalView } from '@/features/protocol/components/goals/protocol-goal-view';

/**
 * Route for a specific goal within a protocol
 * Path: /protocol/plans/:planId/goals/:goalId
 */
export const ProtocolGoalRoute = () => {
  const { planId, goalId } = useParams();

  if (!planId || !goalId) {
    return null;
  }

  return (
    <>
      <Head title="Goal" />
      <ProtocolGoalView protocolId={planId} goalId={goalId} />
    </>
  );
};
