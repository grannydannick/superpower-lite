import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { type ReactElement } from 'react';

import {
  creditsQuery,
  giftsQuery,
  redrawsQuery,
} from '@/features/homepage/api/queries';
import { CardSkeleton } from '@/features/homepage/components/card-skeleton';
import { HomepageActionAccordion } from '@/features/homepage/components/homepage-action-accordion';
import { CreditActionCard } from '@/features/orders/components/credit-action-card';
import { GiftActionCard } from '@/features/orders/components/gift-action-card';
import { RedrawActionCard } from '@/features/redraw/components/redraw-action-card';

export const ActionableOrdersCard = () => {
  const navigate = useNavigate();
  const creditsQueryResult = useQuery(creditsQuery());
  const redrawsQueryResult = useQuery(redrawsQuery());
  const giftsQueryResult = useQuery(giftsQuery());
  const credits = creditsQueryResult.data?.credits ?? [];
  const redraws = redrawsQueryResult.data?.redraws ?? [];
  const gifts = giftsQueryResult.data?.gifts ?? [];
  const items: ReactElement[] = [];

  let hasUnsentGifts = false;
  for (const gift of gifts) {
    if (gift.sentGiftAt === null) {
      hasUnsentGifts = true;
      break;
    }
  }

  if (hasUnsentGifts) {
    items.push(<GiftActionCard key="gift" />);
  }

  for (const redraw of redraws) {
    items.push(
      <RedrawActionCard
        key={redraw.serviceRequestId}
        redraw={redraw}
        onClick={() => {
          void navigate({
            to: '/recollection/$serviceRequestId',
            params: { serviceRequestId: redraw.serviceRequestId },
          });
        }}
      />,
    );
  }

  for (const credit of credits) {
    items.push(<CreditActionCard key={credit.id} credit={credit} />);
  }

  if (
    items.length === 0 &&
    (creditsQueryResult.isPending ||
      redrawsQueryResult.isPending ||
      giftsQueryResult.isPending)
  ) {
    return <CardSkeleton />;
  }

  if (items.length === 0) return null;

  return <HomepageActionAccordion>{items}</HomepageActionAccordion>;
};
