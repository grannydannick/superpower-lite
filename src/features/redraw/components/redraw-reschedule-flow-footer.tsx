import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Dispatch, SetStateAction } from 'react';

import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { getOrdersQueryOptions } from '@/features/orders/api';
import { useCancelRedraw } from '@/features/redraw/api/cancel-redraw';
import { getRedrawsQueryOptions } from '@/features/redraw/api/get-redraws';
import { RequestGroup } from '@/types/api';

import { getScheduledRedrawOrder } from '../utils/get-scheduled-redraw-order';

import { RedrawRescheduleMode } from './redraw-reschedule-mode';

export function RedrawRescheduleFlowFooter({
  mode,
  setMode,
  requestGroup,
}: {
  mode: RedrawRescheduleMode;
  setMode: Dispatch<SetStateAction<RedrawRescheduleMode>>;
  requestGroup: RequestGroup;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const cancelRedrawMutation = useCancelRedraw();
  const scheduledRedrawOrder = getScheduledRedrawOrder(requestGroup);

  const handleConfirm = async () => {
    if (!scheduledRedrawOrder) {
      return;
    }

    if (mode === 'cancel') {
      await cancelRedrawMutation.mutateAsync(scheduledRedrawOrder.id);
      toast.success('Recollection appointment cancelled!');
      void queryClient.invalidateQueries({
        queryKey: getOrdersQueryOptions().queryKey,
      });
      void queryClient.invalidateQueries({
        queryKey: getRedrawsQueryOptions().queryKey,
      });
      void navigate({ to: '/orders' });
      return;
    }

    if (mode === 'reschedule') {
      void navigate({
        to: '/recollection/$serviceRequestId/schedule',
        params: { serviceRequestId: scheduledRedrawOrder.id },
      });
    }
  };

  return (
    <div className="flex items-center gap-4 px-4 py-4 backdrop-blur-sm md:justify-end md:py-8">
      {mode === 'cancel' ? (
        <>
          <Button
            variant="outline"
            className="w-full bg-white md:w-auto"
            onClick={() => setMode('default')}
          >
            Go back
          </Button>
          <Button
            className="w-full md:w-auto"
            onClick={handleConfirm}
            disabled={cancelRedrawMutation.isPending}
          >
            Confirm cancellation
          </Button>
        </>
      ) : null}

      {mode === 'reschedule' ? (
        <>
          <Button
            variant="outline"
            className="w-full md:w-auto"
            onClick={() => setMode('default')}
          >
            Cancel
          </Button>
          <Button className="w-full md:w-auto" onClick={handleConfirm}>
            Confirm reschedule
          </Button>
        </>
      ) : null}
    </div>
  );
}
