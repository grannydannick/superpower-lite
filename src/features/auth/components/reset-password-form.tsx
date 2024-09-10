import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

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
      <div data-testid="success" className="text-center">
        Email sent. You can get back to&nbsp;
        <a
          className="text-zinc-500 hover:cursor-pointer hover:text-zinc-800"
          href="/signin"
        >
          sign in
        </a>
        .
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onFormSubmit)}
        className="w-full max-w-[400px]"
      >
        <div className="my-4 text-center">
          <h1 className="mt-6 text-xl">Reset Password</h1>
          <p className="text-sm text-gray-400">
            Enter the email associated with your account.
          </p>
        </div>
        <div className="flex flex-col space-y-2">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="mt-10 flex flex-col justify-between">
            <Button type="submit">
              {resetPasswordMutation.isPending ? <Spinner /> : 'Reset password'}
            </Button>
            <Button
              type="button"
              className="mt-2"
              variant={'ghost'}
              onClick={() => navigate('/signin')}
            >
              Get back
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
