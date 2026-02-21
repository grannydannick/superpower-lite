import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/sonner';
import { Body2, H3 } from '@/components/ui/typography';
import { useValidateCode } from '@/features/auth/api';
import { useCheckoutContext } from '@/features/auth/stores';
import { useIsFirstRender } from '@/hooks/use-first-render';
import { cn } from '@/lib/utils';
import { clearManualCouponOverride, getAccessCode } from '@/utils/access-code';

const AccessCodeInputSection = () => {
  const { isFirstRender } = useIsFirstRender();
  const {
    processing,
    setCoupon,
    coupon,
    showCoupon,
    setShowCoupon,
    setCouponMetadata,
  } = useCheckoutContext();

  const [code, setCode] = useState(coupon ?? '');

  const validateCodeMutation = useValidateCode({
    mutationConfig: {
      onSuccess: (data, variables) => {
        if (data.coupon) {
          // set coupon code in onboarding context
          setCoupon(variables.accessCode);
          // set updated code in the input box
          setCode(variables.accessCode);
          setCouponMetadata(data.coupon.metadata ?? null);

          toast.success('Access code successfully applied');
        }
      },
      onError: () => {
        setCoupon(null);
        clearManualCouponOverride();
        setCouponMetadata(null);
      },
    },
  });

  const handleApply = () => {
    validateCodeMutation.mutate({
      accessCode: code.toUpperCase().trim(),
    });
  };

  return (
    <section id="subscriptions" className="space-y-6">
      <div className="space-y-2">
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
            onChange={(e) => {
              const nextCode = e.target.value;
              setCode(nextCode);

              if (!nextCode.trim() && !isFirstRender) {
                clearManualCouponOverride();
                setCoupon(getAccessCode());
                validateCodeMutation.reset();
                setCouponMetadata(null);
              }
            }}
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
          <Body2 className="text-vermillion-900">Access code applied</Body2>
        ) : null}
      </div>
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
