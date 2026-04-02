import { useNavigate } from '@tanstack/react-router';

import { ActionableAccordion } from '@/components/shared/actionable-accordion';
import { H4 } from '@/components/ui/typography';
import { useCredits } from '@/features/orders/api/credits';
import { CreditActionCard } from '@/features/orders/components/credit-action-card';
import { useRedraws } from '@/features/redraw/api/get-redraws';
import { RedrawActionCard } from '@/features/redraw/components/redraw-action-card';

export const FinishScheduleList = () => {
  const navigate = useNavigate();
  const creditsQuery = useCredits();
  const redrawsQuery = useRedraws();

  if (creditsQuery.isLoading || redrawsQuery.isLoading) {
    return (
      <div className="h-[82px] w-full animate-pulse rounded-[20px] bg-zinc-200" />
    );
  }

  const credits = creditsQuery.data?.credits ?? [];
  const redraws = redrawsQuery.data?.redraws ?? [];

  if (credits.length === 0 && redraws.length === 0) return null;

  return (
    <div className="space-y-2">
      <H4>Tasks</H4>
      <ActionableAccordion>
        {redraws.map((redraw) => (
          <RedrawActionCard
            key={redraw.serviceRequestId}
            redraw={redraw}
            onClick={() => {
              void navigate({
                to: '/recollection/$serviceRequestId',
                params: { serviceRequestId: redraw.serviceRequestId },
              });
            }}
          />
        ))}
        {credits.map((credit) => (
          <CreditActionCard key={credit.id} credit={credit} />
        ))}
      </ActionableAccordion>
    </div>
  );
};
