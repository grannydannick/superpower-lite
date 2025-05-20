import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm } from 'react-hook-form';

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
  SetPasswordInput,
  setPasswordInputSchema,
  useSetPassword,
} from '@/lib/auth';

export const SetPasswordForm = ({
  id,
  secret,
}: {
  id: string;
  secret: string;
}) => {
  const setPasswordMutation = useSetPassword();
  const form = useForm<SetPasswordInput>({
    resolver: zodResolver(setPasswordInputSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  function onFormSubmit(values: SetPasswordInput) {
    setPasswordMutation.mutate({ data: values, id, secret });
  }

  if (setPasswordMutation.isSuccess) {
    return (
      <div className="flex size-full max-w-3xl flex-1 flex-col justify-between gap-6 md:gap-16 rounded-t-3xl bg-white p-8 md:rounded-3xl md:p-16">
        <SuperpowerLogo />
        <div data-testid="success" className="text-center">
          Password set. You can now&nbsp;
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
    <div className="flex size-full max-w-3xl flex-1 flex-col justify-between gap-16 rounded-t-3xl bg-white p-8 md:rounded-3xl md:p-16">
      <SuperpowerLogo />
      <div>
        <div className="mb-8">
          <H1 className="text-zinc-900">Set password</H1>
          <Body2 className="text-zinc-500">Set password for your account</Body2>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onFormSubmit)}
            className="space-y-8"
          >
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input placeholder="******" type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input placeholder="******" type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="space-y-3">
              <Button className="w-full" type="submit">
                {setPasswordMutation.isPending ? <Spinner /> : 'Set password'}
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
};
