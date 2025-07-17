import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/sonner';
import { Body2, H3 } from '@/components/ui/typography';
import { useValidateCode } from '@/features/auth/api';
import { useOnboarding } from '@/features/onboarding/stores/onboarding-store';
import { useIsFirstRender } from '@/hooks/use-first-render';
import { cn } from '@/lib/utils';
import { clearManualCouponOverride, getAccessCode } from '@/utils/access-code';

const AccessCodeInputSection = () => {
  const { isFirstRender } = useIsFirstRender();
  const { processing, setCoupon, coupon, showAccessCode, setShowAccessCode } =
    useOnboarding();

  const [code, setCode] = useState(coupon ?? '');

  const validateCodeMutation = useValidateCode({
    mutationConfig: {
      onSuccess: (data, variables) => {
        if (data.coupon) {
          // set coupon code in onboarding context
          setCoupon(variables.accessCode);
          // set updated code in the input box
          setCode(variables.accessCode);

          toast.success('Access code successfully applied');
        }
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
    }
  }, [code, isFirstRender]);

  return (
    <section id="subscriptions" className="space-y-6">
      <div className=" space-y-2">
        <div className="flex items-center justify-between">
          <H3 className="text-[#1E1E1E]">Access code</H3>

          {showAccessCode ? (
            <Button
              variant="link"
              size="small"
              className="px-0 text-zinc-500 underline"
              onClick={() => setShowAccessCode(false)}
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
  const showAccessCode = useOnboarding((s) => s.showAccessCode);

  return (
    <AnimatePresence>
      {showAccessCode ? (
        <motion.div
          initial={{ opacity: 0, height: 0, filter: 'blur(5px)' }}
          animate={{ opacity: 1, height: 'auto', filter: 'blur(0px)' }}
          exit={{ opacity: 0, height: 0, filter: 'blur(5px)', marginBottom: 0 }}
          transition={{
            duration: 0.4,
            ease: [0.4, 0, 0.2, 1],
            opacity: { duration: 0.5 },
            height: {
              duration: 0.5,
              type: 'spring',
              stiffness: 100,
              damping: 20,
            },
            filter: { duration: 0.4 },
          }}
          style={{
            willChange: 'transform, opacity, height, filter',
          }}
          key="access-code-section"
          className="mb-6" // hardcoded spacing to avoid layout jump after animation exit
        >
          <AccessCodeInputSection />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
