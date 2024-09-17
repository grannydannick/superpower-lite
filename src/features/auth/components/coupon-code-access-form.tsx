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

    // give priority to rewardfulCoupon
    if (rewardfulCoupon) {
      setAccessCode(rewardfulCoupon);
      return;
    }

    // otherwise check for access code
    const code = searchParams.get('accessCode');

    if (code) {
      setAccessCode(code.toUpperCase());
      localStorage.setItem('superpower-code', code.toUpperCase());
    }
  }, []);

  useEffect(() => {
    if (accessCodeQuery.isSuccess) {
      codeValidated();
    }
  }, [accessCodeQuery.isSuccess, codeValidated]);

  function onFormSubmit(values: ValidateInput) {
    setAccessCode(values.accessCode);
  }

  return (
    <div className="w-full max-w-[400px] space-y-8">
      <div className="space-y-3 text-center">
        <H1 className="text-zinc-900">Welcome</H1>
        <H4 className="text-zinc-600">Please enter your access code</H4>
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
            <Button>
              {accessCodeQuery.isLoading ? (
                <Spinner className="size-6" variant="light" />
              ) : (
                'Next'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
