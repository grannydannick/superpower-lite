import { useNavigate } from '@tanstack/react-router';
import React, { Dispatch, SetStateAction, useState } from 'react';

import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { TransactionSpinner } from '@/components/ui/spinner/transaction-spinner';
import { useAdjustOrder, useUpdateOrder } from '@/features/orders/api';
import { cn } from '@/lib/utils';
import { PhlebotomyLocation, RequestGroup, Slot } from '@/types/api';

import { RescheduleMode } from './reschedule-mode';

export const HealthcareServiceRescheduleFooter = ({
  mode,
  setMode,
  requestGroup,
  selectedSlot,
  selectedLocation,
}: {
  mode: RescheduleMode;
  setMode: Dispatch<SetStateAction<RescheduleMode>>;
  requestGroup: RequestGroup;
  selectedSlot: Slot | null;
  selectedLocation: PhlebotomyLocation | null;
}) => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const updateOrderMutation = useUpdateOrder({});
  const adjustOrderMutation = useAdjustOrder({});

  const handleCancelConfirm = async () => {
    await updateOrderMutation.mutateAsync({
      orderId: requestGroup.id,
      data: { status: 'revoked' },
    });

    void navigate({ to: '/marketplace' });
  };

  const handleRescheduleConfirm = async () => {
    if (!selectedSlot) return;

    if (!selectedLocation?.address) {
      toast.error('No address available for appointment');
      return;
    }

    const address = selectedLocation.address;

    setIsProcessing(true);

    try {
      await adjustOrderMutation.mutateAsync({
        data: {
          orderIds: requestGroup.orders.map((order) => order.id),
          startTime: selectedSlot.start,
          endTime: selectedSlot.end,
          address,
        },
      });

      setMode('reschedule-success');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      className={cn(
        'flex items-center gap-4 px-4 py-4 backdrop-blur-sm md:justify-end md:py-8',
      )}
    >
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
            onClick={handleCancelConfirm}
            disabled={updateOrderMutation.isPending}
          >
            {updateOrderMutation.isPending ? (
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
            Back
          </Button>
          <Button
            className="w-full md:w-auto"
            onClick={() => setMode('reschedule-confirm')}
            disabled={!selectedSlot}
          >
            Continue
          </Button>
        </>
      ) : null}

      {mode === 'reschedule-confirm' ? (
        <>
          <Button
            variant="outline"
            className="w-full md:w-auto"
            onClick={() => setMode('reschedule')}
          >
            Back
          </Button>
          <Button
            className="w-full md:w-auto"
            onClick={handleRescheduleConfirm}
            disabled={adjustOrderMutation.isPending || isProcessing}
          >
            {adjustOrderMutation.isPending || isProcessing ? (
              <TransactionSpinner size="sm" />
            ) : (
              'Confirm reschedule'
            )}
          </Button>
        </>
      ) : null}

      {mode === 'reschedule-success' ? (
        <Button
          className="w-full md:w-auto"
          onClick={() => void navigate({ to: '/orders' })}
        >
          Back to orders
        </Button>
      ) : null}
    </div>
  );
};
