import * as React from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Link, useLocation } from 'react-router-dom';

import { SuperpowerLogo } from '@/components/icons/superpower-logo';
import { Head } from '@/components/seo';
import { Body2 } from '@/components/ui/typography';
import { useUser } from '@/lib/auth';
import { cn } from '@/lib/utils';

type LayoutProps = {
  children: React.ReactNode;
  title: string;
  className?: string;
};

const AuthStepLayoutHeader = () => {
  return (
    <section id="header" className="flex w-full items-center justify-between">
      <div className="size-12" />
      <SuperpowerLogo />
      <div className="size-12" />
    </section>
  );
};

export const AuthLayout = ({ children, title }: LayoutProps) => {
  const location = useLocation();
  const user = useUser();

  const navigate = useNavigate();

  useEffect(() => {
    if (user.data) {
      navigate('/', {
        replace: true,
      });
    }
  }, [user.data, navigate]);

  return (
    <>
      <Head title={title} />
      <div
        className={cn(
          'flex min-h-screen w-full flex-col items-center justify-between p-8 md:py-12',
        )}
      >
        <AuthStepLayoutHeader />
        {children}
        {location.pathname === '/signin' ? (
          <div className="flex flex-col items-center justify-center gap-2">
            <Link
              to="/resetpassword"
              className="text-sm text-zinc-500 hover:text-zinc-800"
            >
              Forgot password
            </Link>
            <div className="flex items-center gap-0.5">
              <Body2 className="text-zinc-500">Don’t have an account?</Body2>
              <Link
                to="https://superpower.com"
                target="_blank"
                className="cursor-pointer text-sm text-vermillion-900"
              >
                Sign up to our waitlist.
              </Link>
            </div>
          </div>
        ) : null}
        {location.pathname === '/register' ? (
          <div className="flex items-center gap-0.5">
            <Body2 className="text-zinc-500">Already a member?</Body2>
            <Link
              to="/signin"
              replace={false}
              className="cursor-pointer text-sm text-[#FC5F2B]"
            >
              Log in
            </Link>
          </div>
        ) : null}
        {location.pathname.includes('password') && <div />}
      </div>
    </>
  );
};
