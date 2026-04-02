import { useNavigate } from '@tanstack/react-router';
import { type ReactElement } from 'react';

import { ActionableAccordion } from '@/components/shared/actionable-accordion';
import { useCredits } from '@/features/orders/api/credits';
import { CreditActionCard } from '@/features/orders/components/credit-action-card';
import { useRedraws } from '@/features/redraw/api/get-redraws';
import { RedrawActionCard } from '@/features/redraw/components/redraw-action-card';

export const ActionableOrdersCard = () => {
  const navigate = useNavigate();
  const creditsQuery = useCredits();
  const redrawsQuery = useRedraws();
  const credits = creditsQuery.data?.credits ?? [];
  const redraws = redrawsQuery.data?.redraws ?? [];
  const items: ReactElement[] = [];

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
