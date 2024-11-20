import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { H1, H4 } from '@/components/ui/typography';
import {
  useValidateCode,
  ValidateInput,
  validateInputSchema,
} from '@/features/auth/api/validate-coupon-code';

interface CouponCodeAccessFormProps {
  codeValidated: () => void;
}

export function CouponCodeAccessForm({
  codeValidated,
}: CouponCodeAccessFormProps): JSX.Element {
  const [searchParams] = useSearchParams();
  const [accessCode, setAccessCode] = useState<string | undefined>(undefined);
  const [isRewardful, setIsRewardful] = useState<boolean>(false);

  const accessCodeQuery = useValidateCode({
    accessCode: accessCode ?? '',
    queryConfig: { enabled: !!accessCode },
  });

  const form = useForm<z.infer<typeof validateInputSchema>>({
    resolver: zodResolver(validateInputSchema),
    defaultValues: {
      accessCode: accessCode || '',
    },
  });

  useEffect(() => {
    const rewardfulCoupon = (window as any).Rewardful?.coupon?.id;

    /**
     * TODO: change order here after EVENT
     */
    const code = searchParams.get('accessCode');

    /**
     * Get priority to access code for now (that we get via ?accessCode=CODE)
     */
    if (code) {
      setAccessCode(code.toUpperCase());
    }

    /**
     * Otherwise use rewardfulCoupon if present
     */
    if (!code && rewardfulCoupon) {
      setAccessCode(rewardfulCoupon);
      setIsRewardful(true);
      return;
    }
  }, []);

  useEffect(() => {
    /**
     * This is more of extra check to make sure we have access code
     */
    if (!accessCode) {
      return;
    }

    if (accessCodeQuery.isSuccess) {
      codeValidated();
      /**
       * toUpperCase() for OUR coupon codes needs to happen on the FE so that on the backend
       * we can verify we don't uppercase all coupon codes
       *
       * rewardfulCoupon doesn't require uppercasing
       * */
      localStorage.setItem(
        'superpower-code',
        isRewardful ? accessCode : accessCode.toUpperCase(),
      );
    }
  }, [accessCodeQuery.isSuccess, codeValidated]);

  function onFormSubmit(values: ValidateInput) {
    setAccessCode(values.accessCode);
  }

  return (
    <div className="w-full max-w-[400px] space-y-8">
      <div className="space-y-3 text-center">
        <H1 className="text-zinc-900">Welcome to Superpower</H1>
        <H4 className="text-zinc-500">Your new era of personal health</H4>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onFormSubmit)}>
          <div className="grid gap-2">
            <div className="grid gap-1">
              <FormField
                control={form.control}
                name="accessCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Access Code</FormLabel>
                    <FormControl>
                      <Input placeholder="Access Code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button>{accessCodeQuery.isLoading ? <Spinner /> : 'Next'}</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
