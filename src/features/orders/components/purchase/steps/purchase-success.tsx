import { useNavigate } from 'react-router';

import { AnimatedTimeline } from '@/components/ui/animated-timeline';
import { Button } from '@/components/ui/button';
import { DialogClose } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Body1, H2 } from '@/components/ui/typography';
import { SHARED_CONTAINER_STYLE } from '@/features/orders/const/config';
import { usePurchaseStore } from '@/features/orders/stores/purchase-store';
import { useUser } from '@/lib/auth';
import { cn } from '@/lib/utils';

import { getTimeline } from '../../../utils/get-timeline';
import { PurchaseDialogFooter } from '../purchase-dialog-footer';

export const PurchaseSuccessStep = () => {
  const navigate = useNavigate();
  const service = usePurchaseStore((s) => s.service);
  const isTestKit = service?.group === 'test-kit';
  const timelineSteps = getTimeline(
    undefined,
    isTestKit ? 'test-kit' : 'credit',
  );
  const { data: user, isLoading } = useUser();

  return (
    <>
      <div className={cn('space-y-8', SHARED_CONTAINER_STYLE)}>
        <div className="space-y-1">
          <H2>Thank you, {user?.firstName}</H2>
          {isLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Body1 className="text-secondary">
              You will receive an email to {user?.email} for additional testing
              details.
            </Body1>
          )}
        </div>
        <AnimatedTimeline timeline={timelineSteps} />
      </div>
      <PurchaseDialogFooter
        prevBtn={null}
        nextBtn={
          <div className="w-full space-y-2">
            <Button
              className="w-full"
              onClick={() =>
                navigate(
                  service.group
                    ? `/schedule?mode=${service.group}`
                    : '/schedule',
                )
              }
            >
              {isTestKit ? 'Ship now' : 'Schedule now'}
            </Button>
            <DialogClose asChild>
              <Button
                onClick={() => navigate('/orders')}
                className="w-full"
                variant="white"
              >
                {isTestKit ? 'Ship later' : 'Schedule later'}
              </Button>
            </DialogClose>
          </div>
        }
      />
    </>
  );
};
