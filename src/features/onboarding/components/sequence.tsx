import { ChevronLeft } from 'lucide-react';
import type { PropsWithChildren } from 'react';

import { cn } from '@/lib/utils';

import { useSequence } from '../hooks/use-screen-sequence';

const Layout = ({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) => (
  <div className={cn('flex min-h-dvh flex-col', className)}>{children}</div>
);

type StepLayoutProps = PropsWithChildren<{
  className?: string;
  centered?: boolean;
  fullHeight?: boolean;
}>;

const StepLayout = ({
  children,
  className,
  centered = false,
  fullHeight = false,
}: StepLayoutProps) => (
  <div
    className={cn(
      'flex flex-1 flex-col',
      centered &&
        'py-12 md:my-auto md:max-h-[900px] md:w-full md:flex-none md:self-center',
      fullHeight && 'md:min-h-screen',
      className,
    )}
  >
    {children}
  </div>
);

const StepHeader = ({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) => (
  <div className={cn('shrink-0 p-4', className)}>{children}</div>
);

const StepMedia = ({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) => (
  <div className="mx-auto rounded-mask">
    <div
      className={cn(
        'media-organic-reveal mx-auto flex h-80 max-h-[calc(100dvh-24rem)] min-h-80 flex-1 items-center overflow-hidden md:max-w-md',
        className,
      )}
    >
      {children}
    </div>
  </div>
);

const StepContent = ({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) => (
  <div className={cn('mb-6 shrink-0 space-y-2 p-6 md:pb-0', className)}>
    {children}
  </div>
);

const StepFooter = ({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) => (
  <div
    className={cn(
      'fixed bottom-0 left-0 right-0 z-50 flex items-center p-6 pt-0 md:relative md:z-auto md:bg-transparent md:pb-20',
      'delay-300 duration-700 animate-in fade-in slide-in-from-bottom-4 fill-mode-both',
      className,
    )}
  >
    {children}
  </div>
);

export const ProgressIndicator = ({
  current,
  total,
}: {
  current: number;
  total: number;
}) => {
  return (
    <div className="flex items-center justify-center gap-1.5 pt-4">
      {Array.from({ length: total }).map((_, index) => (
        <div
          key={index}
          className={cn(
            'h-1.5 rounded-full transition-all',
            index === current ? 'w-6 bg-vermillion-900' : 'w-2 bg-zinc-300',
          )}
        />
      ))}
    </div>
  );
};

export const ProgressHeader = ({
  className,
  showBackButton = true,
}: {
  className?: string;
  showBackButton?: boolean;
}) => {
  const { back, screenIndex, totalScreens } = useSequence();
  const isFirst = screenIndex === 0;

  return (
    <div
      className={cn(
        'relative flex shrink-0 items-center justify-center p-4 py-4',
        'md:fixed md:left-0 md:right-0 md:top-0 md:z-20',
        className,
      )}
    >
      {showBackButton && !isFirst && (
        <button
          type="button"
          onClick={back}
          className="absolute left-4 p-1 text-zinc-500"
          aria-label="Go back"
        >
          <ChevronLeft className="size-6" />
        </button>
      )}
      <ProgressIndicator current={screenIndex} total={totalScreens} />
    </div>
  );
};

export const Sequence = {
  Layout,
  StepLayout,
  StepHeader,
  StepMedia,
  StepContent,
  StepFooter,
  ProgressHeader,
  ProgressIndicator,
};
