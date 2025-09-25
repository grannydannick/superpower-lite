import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Spinner } from '@/components/ui/spinner';
import { Body2, H1 } from '@/components/ui/typography';
import { AuthInput } from '@/features/auth/components/auth-input';
import { LoginInput, loginInputSchema } from '@/lib/auth';
import { useLogin } from '@/lib/auth';
import { User } from '@/types/api';

type LoginFormProps = {
  onSuccess: (data: User) => void;
};

export const LoginForm = ({ onSuccess }: LoginFormProps) => {
  const loginMutation = useLogin({
    onSuccess,
  });

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginInputSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-3">
        <H1 className="text-3xl md:text-5xl">Welcome back</H1>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center">
          <Body2 className="text-zinc-500">Don’t have an account?</Body2>
          <Link
            to="/register"
            className="cursor-pointer text-sm text-vermillion-900"
          >
            Create an account
          </Link>
        </div>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((values) => {
            loginMutation.mutate(values);
          })}
          className="space-y-8"
        >
          <div>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormMessage />
                  <FormControl>
                    <AuthInput
                      border="top"
                      placeholder="Email"
                      autoCapitalize="none"
                      autoComplete="email"
                      autoCorrect="off"
                      icon={<Mail className="size-4 text-zinc-400" />}
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <AuthInput
                      border="bottom"
                      placeholder="Password"
                      autoComplete="current-password"
                      icon={<Lock className="size-4 text-zinc-400" />}
                      type="password"
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
              {loginMutation.isPending ? <Spinner /> : 'Login'}
            </Button>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center">
              <Body2 className="text-zinc-500">
                Forgot your login details?
              </Body2>
              <Link
                to="/resetpassword"
                className="cursor-pointer text-sm text-vermillion-900"
              >
                Reset password
              </Link>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};
