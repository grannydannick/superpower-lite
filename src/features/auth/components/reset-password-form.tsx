import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { SuperpowerLogo } from '@/components/icons/superpower-logo';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Body2, H1 } from '@/components/ui/typography';
import {
  ResetPasswordInput,
  resetPasswordInputSchema,
  useResetPassword,
} from '@/lib/auth';

export function ResetPasswordForm(): JSX.Element {
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
      <div className="flex size-full max-w-3xl flex-1 flex-col justify-between gap-16 rounded-t-3xl bg-white p-8 md:rounded-3xl md:p-16">
        <SuperpowerLogo />
        <div data-testid="success" className="text-center">
          Email sent. You can get back to&nbsp;
          <a
            className="text-vermillion-900 hover:cursor-pointer"
            href="/signin"
          >
            sign in
          </a>
          .
        </div>
        <div className="flex gap-6 text-xs text-zinc-400">
          <a
            href="https://www.superpower.com/privacy"
            target="_blank"
            rel="noreferrer"
            className="transition-colors duration-150 hover:text-zinc-500"
          >
            Privacy Policy
          </a>
          <a
            href="https://www.superpower.com/terms"
            target="_blank"
            rel="noreferrer"
            className="transition-colors duration-150 hover:text-zinc-500"
          >
            Terms of services
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex size-full max-w-3xl flex-1 flex-col justify-between gap-6 md:gap-16 rounded-t-3xl bg-white p-8 md:rounded-3xl md:p-16">
      <SuperpowerLogo />
      <div>
        <div className="mb-8">
          <H1 className="text-zinc-900">Reset Password</H1>
          <Body2 className="text-zinc-500">
            Enter the email associated with your account.
          </Body2>
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
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Email"
                        autoCapitalize="none"
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
                onClick={() => navigate('/signin')}
              >
                Back to sign in
              </Button>
            </div>
          </form>
        </Form>
      </div>
      <div className="flex gap-6 text-xs text-zinc-400">
        <a
          href="https://www.superpower.com/privacy"
          target="_blank"
          rel="noreferrer"
          className="transition-colors duration-150 hover:text-zinc-500"
        >
          Privacy Policy
        </a>
        <a
          href="https://www.superpower.com/terms"
          target="_blank"
          rel="noreferrer"
          className="transition-colors duration-150 hover:text-zinc-500"
        >
          Terms of services
        </a>
      </div>
    </div>
  );
}
