import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm } from 'react-hook-form';

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
      <div data-testid="success" className="text-center">
        Password set. You can now&nbsp;
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
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Set password
          </h1>
          <p className="text-sm text-gray-400">Set password for your account</p>
        </div>
        <div className="flex flex-col space-y-2">
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
          <div className="mt-10 flex flex-col justify-between">
            <Button type="submit">
              {setPasswordMutation.isPending ? <Spinner /> : 'Reset password'}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};
