import React, { Dispatch, SetStateAction } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { TransactionSpinner } from '@/components/ui/spinner/transaction-spinner';
import { GRAIL_GALLERI_MULTI_CANCER_TEST } from '@/const';
import { useCancelOrder } from '@/features/orders/api';
import { RescheduleDialogMode } from '@/features/orders/types/reschedule-dialog-mode';
import { BookingStepID } from '@/features/orders/utils/get-steps-for-service';
import { useAuthorization } from '@/lib/authorization';
import { cn } from '@/lib/utils';
import { HealthcareService, Order, OrderStatus } from '@/types/api';

export const HealthcareServiceRescheduleFooter = ({
  mode,
  setMode,
  setSkipStepIds,
  order,
  healthcareService,
}: {
  mode: RescheduleDialogMode;
  setMode: Dispatch<SetStateAction<RescheduleDialogMode>>;
  setSkipStepIds: Dispatch<SetStateAction<BookingStepID[]>>;
  order: Order;
  healthcareService?: HealthcareService;
}) => {
  const navigate = useNavigate();

  const cancelOrderMutation = useCancelOrder({
    mutationConfig: {
      onSuccess: () => {
        toast.success('Cancelled order');
      },
    },
  });

  const isPastAppointment = order.startTimestamp
    ? new Date(order.startTimestamp) < new Date()
    : false;
  const canReschedule =
    healthcareService?.name !== GRAIL_GALLERI_MULTI_CANCER_TEST;
  const isCancelledOrCompleted = [
    OrderStatus.cancelled,
    OrderStatus.completed,
  ].includes(order.status);

  const { checkAdminActorAccess } = useAuthorization();
  const isAdminActor = checkAdminActorAccess();

  const showDefaultActions =
    (!isPastAppointment && !isCancelledOrCompleted) || isAdminActor;

  const handleConfirm = async () => {
    await cancelOrderMutation.mutateAsync({ orderId: order.id });

    if (mode === 'cancel') {
      // NOTE: do not add ?tab=orders here because we might hit a case where we would immidiately redirect
      // user but credit wouldnt be restored yet
      // I tried to approach this with waitUntil (draft order exists) but what if it was regular cancellation without credit?
      // if u find anything smarter - open PR
      navigate('/marketplace');
    }

    if (mode === 'reschedule') {
      // skip info step for rescheduling since user already knows the service
      setSkipStepIds([BookingStepID.INFO]);
      setMode('booking');
    }
  };

  // footer will be rendered by healthcare service dialog
  if (mode === 'booking') return null;

  return (
    <div
      className={cn(
        'backdrop-blur-sm flex items-center md:justify-end gap-4 px-4 py-4 md:py-8',
      )}
    >
      {mode === 'default' && showDefaultActions ? (
        <>
          <Button
            variant="outline"
            className="w-full bg-white md:w-auto"
            onClick={() => setMode('cancel')}
          >
            Cancel appointment
          </Button>
          {healthcareService && canReschedule ? (
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
            className="w-full bg-white md:w-auto"
            onClick={() => setMode('default')}
          >
            Go back
          </Button>
          <Button
            className="w-full md:w-auto "
            onClick={handleConfirm}
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
            onClick={handleConfirm}
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
