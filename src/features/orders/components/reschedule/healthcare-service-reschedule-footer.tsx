import { useQueryClient } from '@tanstack/react-query';
import React, { Dispatch, SetStateAction } from 'react';

import { Button } from '@/components/ui/button';
import { TransactionSpinner } from '@/components/ui/spinner/transaction-spinner';
import { GRAIL_GALLERI_MULTI_CANCER_TEST } from '@/const';
import {
  resyncDataAfterCancelOrder,
  useCancelOrder,
} from '@/features/orders/api/cancel-order';
import { RescheduleDialogMode } from '@/features/orders/types/reschedule-dialog-mode';
import { StepID } from '@/features/orders/types/step-id';
import { useAuthorization } from '@/lib/authorization';
import { cn } from '@/lib/utils';
import { HealthcareService, Order } from '@/types/api';

export const HealthcareServiceRescheduleFooter = ({
  mode,
  setMode,
  setSkipStepIds,
  order,
  healthcareService,
  onClose,
}: {
  mode: RescheduleDialogMode;
  setMode: Dispatch<SetStateAction<RescheduleDialogMode>>;
  setSkipStepIds: Dispatch<SetStateAction<StepID[]>>;
  order: Order;
  healthcareService: HealthcareService;
  onClose?: () => void;
}) => {
  const queryClient = useQueryClient();
  const cancelOrderMutation = useCancelOrder({
    shouldResyncImmediately: false,
  });
  const isPastAppointment = new Date(order.startTimestamp) < new Date();

  const { checkAdminActorAccess } = useAuthorization();
  const isAdminActor = checkAdminActorAccess();

  const showDefaultActions = !isPastAppointment || isAdminActor;

  const handleConfirm = async (mode: RescheduleDialogMode) => {
    await cancelOrderMutation.mutateAsync({ orderId: order.id });
    if (mode === 'reschedule') {
      // Skip info step for rescheduling since user already knows the service
      setSkipStepIds([StepID.INFO]);
      setMode('booking');
    } else {
      resyncDataAfterCancelOrder({ queryClient });
      onClose?.();
    }
  };

  // footer will be rendered by healthcare service dialog
  if (mode === 'booking') return null;

  return (
    <div
      className={cn(
        // sticky footer only if parent has overflow: auto/scroll (e.g. dialog)
        'bottom-0 z-50 bg-white/90 backdrop-blur-sm flex items-center md:justify-end gap-4 px-6 py-4 md:py-8 md:px-14 [.overflow-auto_&]:sticky [.overflow-y-scroll_&]:sticky',
      )}
    >
      {mode === 'default' && showDefaultActions ? (
        <>
          <Button
            variant="outline"
            className="w-full md:w-auto"
            onClick={() => setMode('cancel')}
          >
            Cancel appointment
          </Button>
          {healthcareService.name !== GRAIL_GALLERI_MULTI_CANCER_TEST ? (
            <Button
              className="w-full md:w-auto"
              onClick={() => setMode('reschedule')}
            >
              Reschedule
            </Button>
          ) : null}
        </>
      ) : null}

      {mode === 'cancel' ? (
        <>
          <Button
            variant="outline"
            className="w-full md:w-auto"
            onClick={() => setMode('default')}
          >
            Go back
          </Button>
          <Button
            className="w-full md:w-auto"
            onClick={() => handleConfirm(mode)}
            disabled={cancelOrderMutation.isPending}
          >
            {cancelOrderMutation.isPending ? (
              <TransactionSpinner size="sm" />
            ) : (
              'Confirm cancellation'
            )}
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
          <Button
            className="w-full md:w-auto"
            onClick={() => handleConfirm(mode)}
            disabled={cancelOrderMutation.isPending}
          >
            {cancelOrderMutation.isPending ? (
              <TransactionSpinner size="sm" />
            ) : (
              'Confirm reschedule'
            )}
          </Button>
        </>
      ) : null}
    </div>
  );
};
