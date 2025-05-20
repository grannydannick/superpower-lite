import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';

import { SuperpowerLogo } from '@/components/icons/superpower-logo';
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
import { LoginInput, loginInputSchema, useLogin } from '@/lib/auth';

type LoginFormProps = {
  onSuccess: () => void;
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
    <div className="flex size-full max-w-3xl flex-1 flex-col justify-between gap-6 md:gap-16 rounded-t-3xl bg-white p-8 md:rounded-3xl md:p-16">
      <SuperpowerLogo />
      <div>
        <div className="mb-8">
          <H1 className="text-zinc-900">Welcome back</H1>
          <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center">
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
              {/* <Link
                to="https://superpower.com"
                target="_blank"
                className="inline-flex w-full items-center justify-center rounded-xl border border-input px-8 py-4 shadow-sm hover:bg-accent hover:text-accent-foreground"
              >
                Join waitlist
              </Link> */}
              <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center">
                <Body2 className="text-zinc-500">
                  Forgot your login details?
                </Body2>
                <Link
                  to="/resetpassword"
                  className="cursor-pointer text-sm text-vermillion-900"
                >
                  Reset
                </Link>
              </div>
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
