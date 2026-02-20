import moment from 'moment';
import { useNavigate } from 'react-router';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Body1, H3 } from '@/components/ui/typography';
import { ProtocolBook } from '@/features/protocol/components/protocol-book';
import { useLatestCompletedPlan } from '@/features/protocol/hooks/use-latest-completed-plan';
import { useAnalytics } from '@/hooks/use-analytics';

type CarePlanDialogProps = {
  open: boolean;
  onOpenChange: (next: boolean) => void;
};

export const CarePlanDialog = ({ open, onOpenChange }: CarePlanDialogProps) => {
  const navigate = useNavigate();
  const { data: latestPlan } = useLatestCompletedPlan();

  const startDate = latestPlan?.period?.start;
  const formattedDate = startDate
    ? moment.utc(startDate).format('MMM DD, YYYY')
    : '';

  const { track } = useAnalytics();

  if (!latestPlan) return null;

  const handleOpenPlan = () => {
    if (!latestPlan?.id) return;
    track('aiap_opened_from_modal', {
      action_plan_id: latestPlan.id,
    });
    onOpenChange(false);
    navigate(`/plans/${latestPlan.id}`);
  };

  const handleDismiss = () => {
    if (!latestPlan?.id) return;
    track('aiap_modal_dismissed', {
      action_plan_id: latestPlan.id,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-2rem)] space-y-8 px-8 pb-4 pt-12 sm:max-w-md">
        <div className="group mx-auto inline-block -rotate-3">
          <ProtocolBook title="Action Plan" date={formattedDate} />
        </div>
        <div className="space-y-6">
          <div className="mx-auto max-w-sm space-y-2">
            <H3 className="text-center">Your action plan is ready</H3>
            <Body1 className="text-center text-secondary">
              Superpower has analyzed your lab results and built a precise
              action plan, tailored to you.
            </Body1>
          </div>
          <div className="flex flex-col justify-center">
            <Button
              onClick={handleOpenPlan}
              variant="default"
              className="rounded-full text-center"
            >
              Take me to my action plan
            </Button>
            <Button
              variant="ghost"
              className="text-center"
              onClick={handleDismiss}
            >
              I’m not interested right now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
