import { sleep } from '@medplum/core';
import { useNavigate } from '@tanstack/react-router';
import React, { Dispatch, SetStateAction, useState } from 'react';

import { Button } from '@/components/ui/button';
import { TransactionSpinner } from '@/components/ui/spinner/transaction-spinner';
import { useUpdateOrder } from '@/features/orders/api';
import { cn } from '@/lib/utils';
import { RequestGroup } from '@/types/api';

import { RescheduleMode } from './reschedule-mode';

export const HealthcareServiceRescheduleFooter = ({
  mode,
  setMode,
  requestGroup,
}: {
  mode: RescheduleMode;
  setMode: Dispatch<SetStateAction<RescheduleMode>>;
  requestGroup: RequestGroup;
}) => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const updateOrderMutation = useUpdateOrder({});

  const handleConfirm = async () => {
    await updateOrderMutation.mutateAsync({
      orderId: requestGroup.id,
      data: { status: 'revoked' },
    });

    if (mode === 'cancel') {
      // NOTE: do not add ?tab=orders here because we might hit a case where we would immidiately redirect
      // user but credit wouldnt be restored yet
      // I tried to approach this with waitUntil (draft order exists) but what if it was regular cancellation without credit?
      // if u find anything smarter - open PR
      void navigate({ to: '/marketplace' });
    }

    if (mode === 'reschedule') {
      // hack to make sure all credits are stored before moving to scheduling again
      setIsProcessing(true);
      await sleep(3000);
      setIsProcessing(false);
      void navigate({ to: '/schedule' });
      return;
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
            onClick={handleConfirm}
            disabled={updateOrderMutation.isPending || isProcessing}
          >
            {updateOrderMutation.isPending || isProcessing ? (
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
            disabled={updateOrderMutation.isPending || isProcessing}
          >
            {updateOrderMutation.isPending || isProcessing ? (
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
