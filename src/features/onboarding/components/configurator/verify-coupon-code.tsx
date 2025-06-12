import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/sonner';
import { Body2, H3 } from '@/components/ui/typography';
import { useValidateCode } from '@/features/auth/api';
import { useOnboarding } from '@/features/onboarding/stores/onboarding-store';
import { useAvailableSubscriptions } from '@/features/settings/api';
import { useDebounce } from '@/hooks/use-debounce';
import { getAccessCode, updateAccessCode } from '@/utils/access-code';

const AccessCodeInputSection = () => {
  // Start with empty code to allow users to enter their own
  const [code, setCode] = useState('');
  const { processing } = useOnboarding();
  const isInitialMount = useRef(true);

  const debouncedCode = useDebounce(
    code ? code.toUpperCase().trim() : '',
    1000,
  );

  const availableSubscriptionsQuery = useAvailableSubscriptions();

  const validateCodeQuery = useValidateCode({
    accessCode: debouncedCode,
    queryConfig: {
      enabled: !!debouncedCode && debouncedCode !== getAccessCode(),
    },
  });

  /**
   * If validateCodeQuery has data (either cached or not)
   * we can be confident that this code is valid and we can update it
   */
  useEffect(() => {
    if (!validateCodeQuery.data?.coupon) {
      return;
    }

    if (validateCodeQuery.data.coupon) {
      updateAccessCode(debouncedCode);
      setCode(debouncedCode);

      availableSubscriptionsQuery.refetch();

      // do not show toast on initial mount
      if (!isInitialMount.current) {
        toast.success('Access code successfully applied');
      }
    }

    isInitialMount.current = false;
  }, [validateCodeQuery.data]);

  // Always show the coupon field, allowing users to override Rewardful coupon
  return (
    <section id="subscriptions" className="w-full space-y-6">
      <div className="space-y-2">
        <H3 className="text-[#1E1E1E]">Access code</H3>
        <Body2 className="text-zinc-500">
          If you were invited by someone, use their code to apply any rewards.
        </Body2>
      </div>
      <div>
        <Input
          placeholder="Enter your access code"
          className={`w-full ${
            validateCodeQuery.isError
              ? 'border-pink-700 focus-visible:ring-0'
              : ''
          }`}
          value={code}
          disabled={processing}
          onChange={(e) => setCode(e.target.value)}
          aria-invalid={validateCodeQuery.isError}
        />
        {validateCodeQuery.isError && debouncedCode && (
          <Body2 className="text-pink-700">Invalid access code</Body2>
        )}
      </div>
    </section>
  );
};

/**
 * Verifies a given coupon code and determines whether the associated access code section should be displayed.
 */
export const VerifyCouponCode = () => {
  const { showAccessCode, setShowAccessCode } = useOnboarding();

  useEffect(() => {
    if (getAccessCode()) {
      setShowAccessCode(true);
    }
  }, [setShowAccessCode]);

  return (
    <AnimatePresence>
      {showAccessCode ? (
        <motion.div
          initial={{ opacity: 0, height: 0, filter: 'blur(5px)' }}
          animate={{ opacity: 1, height: 'auto', filter: 'blur(0px)' }}
          transition={{
            duration: 0.5,
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
          style={{ willChange: 'transform, opacity, height, filter' }}
          key="access-code-section"
        >
          <AccessCodeInputSection />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
