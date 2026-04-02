import { Link } from '@tanstack/react-router';
import { createFileRoute } from '@tanstack/react-router';

import { ActionableAccordion } from '@/components/shared/actionable-accordion';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Body1, H3, H4 } from '@/components/ui/typography';
import { useCredits } from '@/features/orders/api/credits';
import { CreditActionCard } from '@/features/orders/components/credit-action-card';
import { useSubscriptions } from '@/features/rx/api/get-subscriptions';
import { useRxTasks } from '@/features/rx/api/get-tasks';
import { RxActionCard } from '@/features/rx/components/rx-action-card';
import { RxSubscriptionCard } from '@/features/rx/components/rx-subscription-card';
import { Credit, RxSubscription } from '@/types/api';

export const Route = createFileRoute('/_app/rx-subscriptions/')({
  component: RxSubscriptionsComponent,
});

function RxSubscriptionsComponent() {
  const creditsQuery = useCredits();
  const rxTasksQuery = useRxTasks();
  const subscriptionsQuery = useSubscriptions();

  const rxCredits = (creditsQuery.data?.credits ?? []).filter((credit) =>
    credit.serviceId.startsWith('rx-cbp-'),
  );
  const failedPayments = rxTasksQuery.data?.failed_payments ?? 0;
  const hasTasks = rxCredits.length > 0 || failedPayments > 0;
  const subscriptions = subscriptionsQuery.data?.data ?? [];

  if (subscriptionsQuery.isLoading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner variant="primary" size="lg" />
      </div>
    );
  }

  if (subscriptions.length === 0) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-10 px-6 py-9 lg:px-0">
        {hasTasks ? (
          <RxTasksSection
            rxCredits={rxCredits}
            failedPayments={failedPayments}
          />
        ) : null}
        <RxSubscriptionEmpty />
      </div>
    );
  }

  const activeSubscriptions = subscriptions.filter(
    (s) => s.medicationRequest?.status === 'active',
  );

  const pendingSubscriptions = subscriptions.filter(
    (s) => !s.medicationRequest && s.contract,
  );

  const inactiveSubscriptions = subscriptions.filter(
    (s) => s.medicationRequest && s.medicationRequest.status !== 'active',
  );

  return (
    <div className="mx-auto w-full max-w-3xl space-y-10 px-6 py-9 lg:px-0">
      <H3>Manage Subscriptions</H3>
      {hasTasks ? (
        <RxTasksSection rxCredits={rxCredits} failedPayments={failedPayments} />
      ) : null}
      <RxActiveSubscriptions subscriptions={activeSubscriptions} />
      <RxPendingSubscriptions subscriptions={pendingSubscriptions} />
      <RxInactiveSubscriptions subscriptions={inactiveSubscriptions} />
    </div>
  );
}

const RxTasksSection = ({
  rxCredits,
  failedPayments,
}: {
  rxCredits: Credit[];
  failedPayments: number;
}) => {
  return (
    <div className="space-y-2">
      <H4>Tasks</H4>
      {rxCredits.length > 0 ? (
        <ActionableAccordion>
          {rxCredits.map((credit) => (
            <CreditActionCard key={credit.id} credit={credit} />
          ))}
        </ActionableAccordion>
      ) : null}
      {failedPayments > 0 ? (
        <RxActionCard config="FAILED_PAYMENT" variant="highlighted" />
      ) : null}
    </div>
  );
};

const RxSubscriptionEmpty = () => {
  return (
    <div className="flex h-[430px] flex-col items-center justify-center">
      <div className="space-y-1 py-4">
        <H4>You have no active subscription yet</H4>
        <Body1>Level up your health & save with subscriptions</Body1>
      </div>
      <Button asChild>
        <Link to="/marketplace" search={{ tab: 'prescriptions' }}>
          Manage
        </Link>
      </Button>
    </div>
  );
};

const RxActiveSubscriptions = ({
  subscriptions,
}: {
  subscriptions: RxSubscription[];
}) => {
  if (subscriptions.length === 0) return null;

  return (
    <div className="space-y-2">
      <H4>Active Subscriptions</H4>
      <div>
        {subscriptions.map((s, i) => (
          <RxSubscriptionCard key={i} subscription={s} />
        ))}
      </div>
    </div>
  );
};

const RxPendingSubscriptions = ({
  subscriptions,
}: {
  subscriptions: RxSubscription[];
}) => {
  if (subscriptions.length === 0) return null;

  return (
    <div className="space-y-2">
      <H4>Pending Subscriptions</H4>
      <div>
        {subscriptions.map((s, i) => (
          <RxSubscriptionCard key={i} subscription={s} />
        ))}
      </div>
    </div>
  );
};

const RxInactiveSubscriptions = ({
  subscriptions,
}: {
  subscriptions: RxSubscription[];
}) => {
  if (subscriptions.length === 0) return null;

  return (
    <div className="space-y-2">
      <H4>Inactive Subscriptions</H4>
      <div>
        {subscriptions.map((s, i) => (
          <RxSubscriptionCard key={i} subscription={s} />
        ))}
      </div>
    </div>
  );
};
