import * as React from 'react';

import { SuperpowerLogo } from '@/components/icons/superpower-logo';
import { Head } from '@/components/seo';
import { Progress } from '@/components/ui/progress';
import { Body2, H2 } from '@/components/ui/typography';
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

export const ImageWithWithBlockLayout = ({
  children,
  title,
  progress,
}: LayoutProps) => {
  return (
    <>
      <Head title={title} />
      <div
        className={cn(
          'relative w-full flex flex-col items-center justify-center ' +
            'lg:grid lg:grid-cols-2 lg:items-center lg:justify-between md:min-h-screen',
        )}
      >
        <div className="relative order-1 max-h-[180px] w-full md:absolute md:inset-0 md:max-h-none lg:order-1">
          <img
            src="/onboarding/register-bg-alt.webp"
            alt="auth-background"
            className="pointer-events-none size-full object-cover duration-1000 animate-in fade-in-0 "
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
          <div className="absolute inset-0 mt-7 flex flex-col items-center justify-center text-white md:hidden lg:inset-y-0 lg:left-1/2 lg:right-0 lg:mt-0 lg:flex">
            <div className="text-center">
              <H2 className="text-white lg:text-6xl">Every body has</H2>
              <H2 className="text-white/70 lg:text-6xl">100 year potential</H2>
            </div>
          </div>
        </div>

        <div className="relative z-20 order-2 flex h-auto w-full flex-col px-0 md:items-center md:p-10 lg:h-full">
          <div className="flex size-full max-w-3xl flex-1 flex-col justify-between gap-6 overflow-auto rounded-t-3xl bg-white p-8 md:gap-5 md:rounded-3xl md:p-12 lg:p-16">
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
