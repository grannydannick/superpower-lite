import { Link } from '@tanstack/react-router';
import { format } from 'date-fns';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Body1, Body2 } from '@/components/ui/typography';
import { RxSubscription } from '@/types/api';
import { capitalize } from '@/utils/format';
import { getRxImageUrl } from '@/utils/prescription';

export const RxSubscriptionCard = ({
  subscription,
}: {
  subscription: RxSubscription;
}) => {
  if (!subscription.medicationRequest) return null;

  const imgUrl = getRxImageUrl(
    subscription.medicationRequest.medicationDisplay,
  );

  return (
    <div className="flex items-center py-4">
      <img
        className="size-[85px] object-cover"
        src={imgUrl}
        alt={subscription.medicationRequest.medicationDisplay}
      />
      <div className="space-y-2">
        <Badge
          variant={
            subscription.medicationRequest.status === 'active'
              ? 'vermillion'
              : 'secondary'
          }
        >
          {capitalize(subscription.medicationRequest.status)}
        </Badge>
        <Body1>{subscription.medicationRequest.medicationDisplay}</Body1>
        {subscription.contract.anchorDate ? (
          <Body2 className="text-secondary">
            Next refill{' '}
            {format(new Date(subscription.contract.anchorDate), 'MMM d, yyyy')}
          </Body2>
        ) : null}
      </div>
      <div className="ml-auto flex flex-col items-center justify-center">
        <Button variant="outline" size="medium" asChild>
          <Link
            to="/rx-subscriptions/$id"
            params={{ id: subscription.medicationRequest.id }}
          >
            Manage
          </Link>
        </Button>
      </div>
    </div>
  );
};
