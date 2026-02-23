import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useSearch } from '@tanstack/react-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

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
import { env } from '@/config/env';
import { useSendMagicLink } from '@/features/auth/api/send-magic-link';
import { AuthInput } from '@/features/auth/components/auth-input';
import { useLogin } from '@/lib/auth';
import { loginInputSchema } from '@/lib/auth-schemas';
import { User } from '@/types/api';

const passwordLoginSchema = loginInputSchema;
const magicLinkLoginSchema = z.object({
  ...loginInputSchema.shape,
  // allow blank password in magic-link mode (we don’t render the field)
  password: z.string(),
});

type LoginFormInput = z.input<typeof passwordLoginSchema>;
type LoginFormData = z.output<typeof passwordLoginSchema>;

type LoginFormProps = {
  redirectTo?: string;
  onSuccessWithPassword: (data: User) => void;
  onSuccessWithMagicLink: (email: string) => void;
};

export const LoginForm = ({
  redirectTo,
  onSuccessWithPassword,
  onSuccessWithMagicLink,
}: LoginFormProps) => {
  const [loginMode, setLoginMode] = useState<'magic-link' | 'password'>(
    'magic-link',
  );

  const defaultEmail = useSearch({
    from: '/signin',
    select: (s) => s.email,
  });

  const loginMutation = useLogin({
    onSuccess: onSuccessWithPassword,
  });

  const form = useForm<LoginFormInput, unknown, LoginFormData>({
    resolver: zodResolver(
      loginMode === 'magic-link' ? magicLinkLoginSchema : passwordLoginSchema,
    ),
    defaultValues: {
      email: defaultEmail ?? '',
      password: '',
    },
  });

  const setLoginModeWithReset = (nextMode: 'magic-link' | 'password') => {
    const email = form.getValues('email');
    form.reset({ email, password: '' });
    setLoginMode(nextMode);
  };

  const sendMagicLinkMutation = useSendMagicLink({
    mutationConfig: {
      onSuccess: () => {
        const email = form.getValues('email');
        onSuccessWithMagicLink(email);
      },
      onError: () => {
        // Toast will error with message automatically
        // We'll switch to password if magic link fails
        setLoginModeWithReset('password');
      },
    },
  });

  const handleSubmit = (values: LoginFormData) => {
    if (loginMode === 'magic-link') {
      sendMagicLinkMutation.mutate({
        data: {
          email: values.email,
          redirectTo: redirectTo,
          origin: 'login',
        },
      });
    } else {
      loginMutation.mutate(values);
    }
  };

  const isLoading =
    loginMode === 'magic-link'
      ? sendMagicLinkMutation.isPending
      : loginMutation.isPending;

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-3">
        <H1 className="text-3xl md:text-5xl">Welcome back</H1>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center">
          <Body2 className="text-zinc-500">Don&apos;t have an account?</Body2>
          <a
            href={`${env.MARKETING_SITE_URL}/checkout`}
            className="cursor-pointer text-sm text-vermillion-900"
          >
            Create an account
          </a>
        </div>
      </div>

      {defaultEmail != null && defaultEmail.length > 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
          <Body2 className="text-secondary">
            An account with the email{' '}
            <span className="font-medium">{defaultEmail}</span> already exists.
            Please login.
          </Body2>
        </div>
      ) : null}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <FormItem>
                  <Body2 className="mb-2 text-secondary">Email</Body2>
                  <FormControl>
                    <AuthInput
                      variant={fieldState.error ? 'error' : 'individual'}
                      placeholder="Your email"
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
            {loginMode === 'password' && (
              <FormField
                control={form.control}
                name="password"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <Body2 className="mb-2 text-secondary">Password</Body2>
                    <FormControl>
                      <AuthInput
                        variant={fieldState.error ? 'error' : 'individual'}
                        placeholder="Your password"
                        autoComplete="current-password"
                        type="password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
          <div className="space-y-3">
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? <Spinner /> : 'Login'}
            </Button>

            <div>
              {loginMode === 'magic-link' ? (
                <>
                  <button
                    type="button"
                    onClick={() => setLoginModeWithReset('password')}
                    className="text-sm font-normal text-vermillion-900 hover:underline"
                  >
                    Sign in with password instead.
                  </button>
                </>
              ) : (
                <>
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center">
                    <Body2 className="text-secondary">
                      Forgot your login details?
                    </Body2>
                    <Link
                      to="/resetpassword"
                      className="cursor-pointer text-sm text-vermillion-900"
                    >
                      Reset password
                    </Link>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLoginModeWithReset('magic-link')}
                    className="text-sm font-normal text-vermillion-900 hover:underline"
                  >
                    Sign in with magic link.
                  </button>
                </>
              )}
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};
