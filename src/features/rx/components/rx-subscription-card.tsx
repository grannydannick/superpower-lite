import { Link } from '@tanstack/react-router';
import { format } from 'date-fns';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Body1, Body2 } from '@/components/ui/typography';
import { RxSubscription } from '@/types/api';
import { capitalize } from '@/utils/format';
import {
  getDisplayNameFromRxCode,
  getPrescriptionImage,
} from '@/utils/prescription';

export const RxSubscriptionCard = ({
  subscription,
}: {
  subscription: RxSubscription;
}) => {
  const medicationRequest = subscription.medicationRequest;
  const displayName =
    medicationRequest?.medicationDisplay ??
    getDisplayNameFromRxCode(subscription.contract.rxCode);
  const imgUrl = getPrescriptionImage(displayName ?? '');
  const isPending = !medicationRequest;

  return (
    <div className="flex items-center py-4">
      <img
        className="size-[85px] object-cover"
        src={imgUrl}
        alt={displayName ?? 'Prescription'}
      />
      <div className="space-y-2">
        <Badge
          variant={
            isPending
              ? 'secondary'
              : medicationRequest.status === 'active'
                ? 'vermillion'
                : 'secondary'
          }
        >
          {isPending ? 'Pending' : capitalize(medicationRequest.status)}
        </Badge>
        <Body1>{displayName ?? 'Prescription'}</Body1>
        {isPending ? (
          <Body2 className="text-secondary">Prescription under review</Body2>
        ) : subscription.contract.anchorDate ? (
          <Body2 className="text-secondary">
            Next refill{' '}
            {format(new Date(subscription.contract.anchorDate), 'MMM d, yyyy')}
          </Body2>
        ) : null}
      </div>
      {!isPending && (
        <div className="ml-auto flex flex-col items-center justify-center">
          <Button variant="outline" size="medium" asChild>
            <Link
              to="/rx-subscriptions/$id"
              params={{ id: medicationRequest.id }}
            >
              Manage
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
};
