import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/sonner';
import { Body2, H3 } from '@/components/ui/typography';
import { useValidateCode } from '@/features/auth/api';
import { useCheckoutContext } from '@/features/auth/stores';
import { useIsFirstRender } from '@/hooks/use-first-render';
import { cn } from '@/lib/utils';
import {
  clearManualCouponOverride,
  getAccessCode,
  setManualCouponOverride,
} from '@/utils/access-code';

import { EventDrawInvitationModal } from '../../event-draw-invitation-modal';

const AccessCodeInputSection = () => {
  const { isFirstRender } = useIsFirstRender();
  const { processing, setCoupon, coupon, showCoupon, setShowCoupon } =
    useCheckoutContext();

  const [code, setCode] = useState(coupon ?? '');
  const [showEventDrawModal, setShowEventDrawModal] = useState(false);

  const handleEventDrawModalContinue = () => {
    setCoupon(code);
    setCode(code);
    setShowEventDrawModal(false);
  };

  const validateCodeMutation = useValidateCode({
    mutationConfig: {
      onSuccess: (data, variables) => {
        if (data.coupon) {
          setManualCouponOverride(variables.accessCode, data.coupon.metadata);

          const isEventDraw = data.coupon.metadata?.event_type === 'event_draw';

          if (isEventDraw) {
            setShowEventDrawModal(true);
          } else {
            setCoupon(variables.accessCode);
            setCode(variables.accessCode);
          }

          toast.success('Access code successfully applied');
        }
      },
      onError: (error) => {
        toast.error(error.message);
        setCoupon(null);
        clearManualCouponOverride();
        setShowEventDrawModal(false);
      },
    },
  });

  const handleApply = () => {
    validateCodeMutation.mutate({
      accessCode: code.toUpperCase().trim(),
    });
  };

  useEffect(() => {
    if (!code.trim() && !isFirstRender) {
      clearManualCouponOverride();
      setCoupon(getAccessCode());
      validateCodeMutation.reset();
      setShowEventDrawModal(false);
    }
  }, [code, isFirstRender]);

  return (
    <section id="subscriptions" className="space-y-6">
      <div className=" space-y-2">
        <div className="flex items-center justify-between">
          <H3 className="text-[#1E1E1E]">Access code</H3>

          {showCoupon ? (
            <Button
              variant="link"
              size="small"
              className="px-0 text-zinc-500 underline"
              onClick={() => setShowCoupon(false)}
              disabled={processing}
            >
              Hide
            </Button>
          ) : null}
        </div>
        <Body2 className="text-zinc-500">
          If you were invited by someone, use their code to apply any rewards.
        </Body2>
      </div>
      <div className="space-y-1">
        <div className="flex gap-2">
          <Input
            placeholder="Enter your access code"
            className={cn(
              'w-full',
              validateCodeMutation.isError
                ? 'border-pink-700 focus-visible:ring-0'
                : '',
            )}
            onKeyDown={(e) => {
              if (
                e.key === 'Enter' &&
                !validateCodeMutation.isPending &&
                code.trim()
              ) {
                handleApply();
              }
            }}
            value={code}
            disabled={processing}
            onChange={(e) => setCode(e.target.value)}
            aria-invalid={validateCodeMutation.isError}
          />
          <Button
            disabled={
              validateCodeMutation.isPending || processing || !code.trim()
            }
            type="button"
            onClick={handleApply}
          >
            Apply
          </Button>
        </div>
        {validateCodeMutation.isPending ? (
          <Body2 className="text-zinc-500">Validating code...</Body2>
        ) : null}
        {validateCodeMutation.isError ? (
          <Body2 className="text-pink-700">Invalid or expired code</Body2>
        ) : null}
        {validateCodeMutation.data?.coupon ? (
          <Body2 className="text-vermillion-700">Access code applied</Body2>
        ) : null}
      </div>

      {/* Event Draw Invitation Modal */}
      <EventDrawInvitationModal
        isOpen={showEventDrawModal}
        onContinue={handleEventDrawModalContinue}
      />
    </section>
  );
};

/**
 * Verifies a given coupon code and determines whether the associated access code section should be displayed.
 */
export const VerifyCouponCodeSection = () => {
  const showAccessCode = useCheckoutContext((s) => s.showCoupon);

  return showAccessCode ? <AccessCodeInputSection /> : null;
};
