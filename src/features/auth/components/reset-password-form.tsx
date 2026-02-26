import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import React from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Body1, H3 } from '@/components/ui/typography';
import { useResetPassword } from '@/lib/auth';
import { resetPasswordInputSchema } from '@/lib/auth-schemas';
import type { ResetPasswordInput } from '@/lib/auth-schemas';

export function ResetPasswordForm() {
  const resetPasswordMutation = useResetPassword();
  const navigate = useNavigate();
  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordInputSchema),
    defaultValues: {
      email: '',
    },
  });

  const onFormSubmit = (values: ResetPasswordInput) => {
    resetPasswordMutation.mutate({ data: values });
  };

  if (resetPasswordMutation.isSuccess) {
    return (
      <div className="flex size-full max-w-3xl flex-1 flex-col justify-between gap-16 rounded-t-3xl bg-white md:rounded-3xl">
        <div
          data-testid="success"
          className="flex h-full items-center justify-center"
        >
          Email sent. You can get back to&nbsp;
          <a
            className="text-vermillion-900 hover:cursor-pointer"
            href="/signin"
          >
            sign in
          </a>
          .
        </div>
      </div>
    );
  }

  return (
    <div className="flex size-full max-w-3xl flex-1 flex-col justify-center gap-6 rounded-t-3xl bg-white md:gap-16 md:rounded-3xl">
      <div className="flex flex-col gap-6">
        <div className="space-y-3">
          <H3 className="text-3xl md:text-5xl">Reset Password</H3>
          <Body1 className="text-zinc-500">
            Enter the email associated with your account.
          </Body1>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onFormSubmit)}
            className="space-y-8"
          >
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Your email"
                        aria-label="Email"
                        autoCapitalize="none"
                        variant={fieldState.error ? 'error' : 'default'}
                        autoComplete="email"
                        autoCorrect="off"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="space-y-3">
              <Button className="w-full" type="submit">
                {resetPasswordMutation.isPending ? (
                  <Spinner />
                ) : (
                  'Reset password'
                )}
              </Button>
              <Button
                type="button"
                className="w-full"
                variant="outline"
                onClick={() => {
                  void navigate({ to: '/signin' });
                }}
              >
                Back to sign in
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
