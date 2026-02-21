import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useSearchParams } from 'react-router';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { toast } from '@/components/ui/sonner';
import { Spinner } from '@/components/ui/spinner';
import { Body2, H1 } from '@/components/ui/typography';
import { env } from '@/config/env';
import { useSendMagicLink } from '@/features/auth/api/send-magic-link';
import { AuthInput } from '@/features/auth/components/auth-input';
import { useLogin } from '@/lib/auth';
import { loginInputSchema } from '@/lib/auth-schemas';
import type { LoginInput } from '@/lib/auth-schemas';
import { User } from '@/types/api';

const magicLinkLoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

const passwordLoginSchema = loginInputSchema;

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

  const [searchParams] = useSearchParams();
  const defaultEmail = searchParams.get('email');

  const loginMutation = useLogin({
    onSuccess: onSuccessWithPassword,
  });

  const sendMagicLinkMutation = useSendMagicLink({
    mutationConfig: {
      onSuccess: () => {
        const email = form.getValues('email');
        onSuccessWithMagicLink(email);
      },
      onError: () => {
        // Toast will error with message automatically
        //  We'll switch to password if magic link fails
        setLoginMode('password');
      },
    },
  });

  // Switch the resolver based on the active mode so validation matches the
  // fields we render (email-only for magic link, email+password otherwise).
  const form = useForm<LoginInput>({
    resolver: zodResolver(
      loginMode === 'magic-link' ? magicLinkLoginSchema : passwordLoginSchema,
    ),
    defaultValues: {
      email: defaultEmail || '',
      password: '',
    },
  });

  useEffect(() => {
    const email = form.getValues('email');
    form.reset({ email, password: '' });
  }, [form, loginMode]);

  useEffect(() => {
    if (defaultEmail) {
      toast.info(
        `An account with the email ${defaultEmail} already exists. Please login.`,
      );
    }
  }, [defaultEmail]);

  const handleSubmit = (values: LoginInput) => {
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
                    onClick={() => setLoginMode('password')}
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
                    onClick={() => setLoginMode('magic-link')}
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
