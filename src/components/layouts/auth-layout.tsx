import * as React from 'react';

import { SuperpowerLogo } from '@/components/icons/superpower-logo';
import { Head } from '@/components/seo';
import { Progress } from '@/components/ui/progress';
import { Body2 } from '@/components/ui/typography';
import { cn } from '@/lib/utils';

// NOTE: progress here is used if we want to indicate any type of progress like 1/3 steps etc
type LayoutProps = {
  children: React.ReactNode;
  title: string;
  className?: string;
  progress?: {
    current: number;
    total: number;
  };
};

const FooterLinks = () => (
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
      Terms of Service
    </a>
  </div>
);

export const AuthLayout = ({ children, title, progress }: LayoutProps) => {
  return (
    <>
      <Head title={title} />
      <div
        className={cn(
          'relative w-full flex flex-col',
          'md:min-h-screen md:items-center md:justify-center',
        )}
      >
        <div className="relative z-0 order-1 max-h-[180px] w-full md:absolute md:inset-0 md:max-h-none">
          <img
            src="/onboarding/shared/backgrounds/register-bg-alt.webp"
            alt="auth-background"
            className="pointer-events-none size-full select-none object-cover"
            style={{ minHeight: '100%', minWidth: '100%' }}
          />

          <div className="absolute inset-x-4 top-5 z-20 flex items-center justify-between text-white md:hidden">
            <SuperpowerLogo width={122} fill="#fff" />
            {progress ? (
              <div className="flex items-center gap-4">
                <Body2 className="text-white">
                  Step {progress.current} / {progress.total}
                </Body2>
                <Progress
                  value={(progress.current / progress.total) * 100}
                  variant="light"
                  className="h-[3px] w-20"
                />
              </div>
            ) : null}
          </div>
        </div>

        <div className="relative z-20 order-2 flex w-full flex-col justify-center md:h-dvh md:py-12">
          <div className="mx-auto flex size-full max-h-[1150px] flex-col justify-between gap-6 overflow-auto rounded-t-3xl bg-white p-8 md:max-w-3xl md:gap-5 md:rounded-3xl md:p-16">
            <div className="hidden items-center justify-between md:flex">
              <SuperpowerLogo width={122} />
              {progress ? (
                <div className="flex items-center gap-4">
                  <Body2 className="text-zinc-400">
                    Step {progress.current} / {progress.total}
                  </Body2>
                  <Progress
                    value={(progress.current / progress.total) * 100}
                    className="h-[3px] w-20"
                  />
                </div>
              ) : null}
            </div>
            {children}
            <FooterLinks />
          </div>
        </div>
      </div>
    </>
  );
};
