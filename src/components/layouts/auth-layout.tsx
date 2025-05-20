import * as React from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useSearchParams } from 'react-router-dom';

import { Head } from '@/components/seo';
import { useUser } from '@/lib/auth';
import { cn } from '@/lib/utils';

type LayoutProps = {
  children: React.ReactNode;
  title: string;
  className?: string;
};

const RESTRICTED_REDIRECT_ROUTES = ['/users'];

export const AuthLayout = ({ children, title }: LayoutProps) => {
  const user = useUser();

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo');

  // when we sign in from users (as admin) we don't want to be redirected to the same page
  const shouldRedirect =
    redirectTo !== null && !RESTRICTED_REDIRECT_ROUTES.includes(redirectTo);

  useEffect(() => {
    if (user.data) {
      navigate(shouldRedirect ? redirectTo : '/', {
        replace: true,
      });
    }
  }, [user.data, navigate, shouldRedirect, redirectTo]);

  return (
    <>
      <Head title={title} />
      <div
        className={cn(
          'lg:grid flex justify-items-center grid-cols-2 min-h-screen w-full flex-col items-center justify-end lg:justify-between bg-[#170B06]',
        )}
      >
        <div className="relative z-20 flex size-full h-auto flex-col justify-end md:p-12 lg:h-full">
          {children}
        </div>
        <div className="absolute inset-0 size-full h-1/2 duration-1000 animate-in fade-in-0 slide-in-from-bottom-10 md:h-full lg:relative">
          <div className="absolute left-0 z-10 h-full w-40 bg-gradient-to-l from-transparent to-[#170B06]" />
          <div className="absolute top-0 z-10 h-40 w-full bg-gradient-to-t from-transparent to-[#170B06]" />
          <div className="absolute bottom-0 z-10 h-40 w-full bg-gradient-to-b from-transparent to-[#170B06] md:hidden" />
          <img
            src="/onboarding/login-bg.webp"
            alt="auth-background"
            className="size-full object-cover"
          />
        </div>
      </div>
    </>
  );
};
