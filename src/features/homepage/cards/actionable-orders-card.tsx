import { useSuspenseQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { type ReactElement } from 'react';

import { ActionableAccordion } from '@/components/shared/actionable-accordion';
import { getCreditsQueryOptions } from '@/features/orders/api/credits';
import { getGiftsQueryOptions } from '@/features/orders/api/get-gifts';
import { CreditActionCard } from '@/features/orders/components/credit-action-card';
import { GiftActionCard } from '@/features/orders/components/gift-action-card';
import { getRedrawsQueryOptions } from '@/features/redraw/api/get-redraws';
import { RedrawActionCard } from '@/features/redraw/components/redraw-action-card';

export const ActionableOrdersCard = () => {
  const navigate = useNavigate();
  const { data: creditsData } = useSuspenseQuery(getCreditsQueryOptions());
  const { data: redrawsData } = useSuspenseQuery(getRedrawsQueryOptions());
  const { data: giftsData } = useSuspenseQuery(getGiftsQueryOptions());
  const credits = creditsData?.credits ?? [];
  const redraws = redrawsData?.redraws ?? [];
  const gifts = giftsData?.gifts ?? [];
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

  return <ActionableAccordion>{items}</ActionableAccordion>;
};
