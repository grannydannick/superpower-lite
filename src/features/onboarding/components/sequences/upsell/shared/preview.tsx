import { ChevronLeft, Sparkle } from 'lucide-react';
import type { PropsWithChildren } from 'react';

import { SuperpowerLogo } from '@/components/icons/superpower-logo';
import { Button } from '@/components/ui/button';
import { useAnalytics } from '@/hooks/use-analytics';
import { cn } from '@/lib/utils';

import { useSequence } from '../../../../hooks/use-screen-sequence';
import { Sequence } from '../../../sequence';

import { BackButton } from './back-button';
import { usePanelId, useUpsellPanelIds } from './panel-id-context';

/**
 * Preview.Layout - Responsive layout for upsell preview screens
 *
 * Mobile: Full-bleed dark background with gradient blur overlay
 * Desktop: Light background with contained rounded image
 *
 * Note: backgroundImage is a structural prop (determines responsive layout behavior)
 * Use desktopImageBleed to let the desktop image display at natural size without constraints
 */
type LayoutProps = PropsWithChildren<{
  backgroundImage?: string;
  desktopImageBleed?: boolean;
  className?: string;
}>;

const Layout = ({
  backgroundImage,
  desktopImageBleed,
  className,
  children,
}: LayoutProps) => (
  <Sequence.StepLayout
    centered
    className={cn(
      'relative overflow-hidden',
      'bg-black text-white',
      'md:bg-zinc-50 md:text-zinc-900',
      className,
    )}
  >
    {backgroundImage && (
      <div className="absolute inset-0 md:hidden">
        <img
          src={backgroundImage}
          alt=""
          className="absolute inset-0 size-full object-cover"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/20" />
        <div className="absolute inset-0 backdrop-blur-sm [mask-image:linear-gradient(to_bottom,transparent_0%,transparent_40%,black_100%)]" />
      </div>
    )}

    <div className="fixed left-0 top-0 z-20 hidden w-full px-10 py-2 md:flex md:h-14 md:items-center">
      <SuperpowerLogo className="h-4 w-[122px]" />
    </div>

    <div className="hidden w-full max-w-md flex-col md:mx-auto md:flex">
      <BackButton className="mb-4" />
      {backgroundImage && (
        <img
          src={backgroundImage}
          alt=""
          className={cn(
            desktopImageBleed
              ? 'h-auto max-h-[450px] w-auto'
              : 'h-[265px] w-full rounded-2xl object-cover',
          )}
        />
      )}
    </div>

    {children}
  </Sequence.StepLayout>
);

const Header = ({ className }: { className?: string }) => {
  const { back } = useSequence();

  return (
    <Sequence.StepHeader
      className={cn(
        'relative z-10 pt-0 flex items-center justify-between md:hidden',
        className,
      )}
    >
      <button
        type="button"
        onClick={back}
        className="flex size-9 items-center justify-center"
        aria-label="Go back"
      >
        <ChevronLeft className="size-6 text-white" />
      </button>
      <span className="text-sm font-medium text-white">
        Recommended for you
      </span>
      <div className="size-9" />
    </Sequence.StepHeader>
  );
};

const Label = ({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) => (
  <div
    className={cn(
      'mx-auto inline-flex w-fit items-center gap-2 rounded-full px-3 py-2 text-sm',
      'bg-white/10 text-white/80 backdrop-blur-xl',
      'md:bg-vermillion-900/10 md:text-vermillion-900 md:backdrop-blur-none',
      className,
    )}
  >
    <Sparkle className="size-3.5 fill-current" />
    <span>{children}</span>
  </div>
);

const Content = ({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) => (
  <div
    className={cn(
      'relative z-10 flex flex-col',
      'flex-1 justify-end',
      'md:flex-none md:items-center md:justify-start md:pt-6',
    )}
  >
    <Sequence.StepContent
      className={cn(
        'space-y-4 text-center',
        'md:w-full md:max-w-md md:space-y-[17px] md:px-0',
        className,
      )}
    >
      {children}
    </Sequence.StepContent>
  </div>
);

const Footer = ({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) => (
  <Sequence.StepFooter
    className={cn(
      'z-10 flex-col gap-2',
      'md:mx-auto md:mt-4 md:w-full md:max-w-md md:gap-2 md:px-0',
      className,
    )}
  >
    {children}
  </Sequence.StepFooter>
);

const SkipButton = ({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) => {
  const { skipNext } = useSequence();
  const panelId = usePanelId();
  const shownPanelIds = useUpsellPanelIds();
  const { track } = useAnalytics();

  const handleSkip = () => {
    if (panelId) {
      track('upsell_preview_skipped', {
        panel_id: panelId,
        shown_panel_ids: shownPanelIds,
      });
    }
    skipNext();
  };

  return (
    <button
      type="button"
      onClick={handleSkip}
      className={cn(
        'hidden py-4 text-base text-zinc-500 transition-all duration-150 hover:text-primary md:block',
        className,
      )}
    >
      {children}
    </button>
  );
};

const PrimaryButton = () => {
  const { next } = useSequence();
  const panelId = usePanelId();
  const shownPanelIds = useUpsellPanelIds();
  const { track } = useAnalytics();

  const handleClick = () => {
    if (panelId) {
      track('upsell_preview_cta_clicked', {
        panel_id: panelId,
        shown_panel_ids: shownPanelIds,
      });
    }
    next();
  };

  return (
    <Button
      onClick={handleClick}
      variant="white"
      className="w-full md:bg-zinc-900 md:text-white md:hover:bg-zinc-800"
    >
      See testing options
    </Button>
  );
};

export const Preview = {
  Layout,
  Header,
  Label,
  Content,
  Footer,
  SkipButton,
  PrimaryButton,
};
