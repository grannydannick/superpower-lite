import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Input } from '@/components/ui/input';
import { Body1, H2 } from '@/components/ui/typography';
import { useValidateCode } from '@/features/auth/api';
import { useOnboarding } from '@/features/onboarding/stores/onboarding-store';
import { useAvailableSubscriptions } from '@/features/settings/api';
import { useDebounce } from '@/hooks/use-debounce';
import { getAccessCode, updateAccessCode } from '@/utils/access-code';

export const VerifyCouponCode = () => {
  const rewardfulCoupon = (window as any).Rewardful?.coupon?.id;
  const [code, setCode] = useState(getAccessCode() ?? '');
  const { processing } = useOnboarding();

  const debouncedCode = useDebounce(
    rewardfulCoupon ? code.trim() : code.toUpperCase().trim(),
    1000,
  );

  const availableSubscriptionsQuery = useAvailableSubscriptions();

  const validateCodeQuery = useValidateCode({
    accessCode: debouncedCode,
    queryConfig: {
      enabled: debouncedCode !== getAccessCode() && !!debouncedCode,
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
      toast.success(`Updated coupon code to ${debouncedCode}`);
    }
  }, [validateCodeQuery.data]);

  // we don't want user to edit rewardful coupon code
  if (rewardfulCoupon) {
    return null;
  }

  return (
    <section id="subscriptions" className="w-full space-y-6">
      <div className="space-y-2">
        <H2 className="text-[#1E1E1E]">Access code</H2>
        <Body1 className="text-zinc-500">
          Please verify that your access code is correct, as it will be used to
          apply any applicable discounts during checkout.
        </Body1>
      </div>
      <div>
        <Input
          placeholder="Enter your coupon code"
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
        {validateCodeQuery.isError && (
          <Body1 className="text-pink-700">Invalid access code</Body1>
        )}
      </div>
    </section>
  );
};
