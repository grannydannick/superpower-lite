import { X } from 'lucide-react';

import { APP_STORE_URL } from '@/const/app-store';
import { useDownloadAppDismissedStore } from '@/features/homepage/stores/download-app-dismissed-store';
import { QrCodeDialog } from '@/features/settings/components/wearables/mobile-app-banner';
import { useAnalytics } from '@/hooks/use-analytics';
import { isAndroid, isIOS } from '@/utils/browser-detection';

// Future-proofing seam — replaced when we have a backend / PostHog signal
// indicating the member already has the iOS app installed.
// TODO: wire up real detection (e.g. PostHog person property derived from
// mobile-app analytics events) and remove this stub.
function userHasApp(): boolean {
  return false;
}

// Custom marketing gradient pulled from the rendered Figma card (node
// 2208:1667). Not wired to the design system's vermillion palette because
// the Figma uses darker, custom amber tones for this hero treatment.
const CARD_BACKGROUND_IMAGE = [
  'radial-gradient(70% 140% at 30% 35%, rgba(255, 195, 130, 0.35) 0%, transparent 55%)',
  'linear-gradient(105deg, #a13c1c 0%, #c45226 35%, #d76437 60%, #b85128 100%)',
].join(', ');

const CARD_STYLE = { backgroundImage: CARD_BACKGROUND_IMAGE };

const CARD_CLASS_NAME =
  'relative overflow-hidden rounded-[20px] border border-black/10 text-white shadow-[0px_4px_4px_0px_rgba(0,0,0,0.05)]';

/**
 * Apple App Store badge — official Figma export (file
 * ds4lbWxQkADI5EW53gp7Gt, node 2225:1469). Real vector at 84×28, stays
 * crisp at any pixel density.
 */
function AppStoreBadge({ className }: { className?: string }) {
  return (
    <img
      src="/assets/download-app-cta/appstore-badge.svg"
      alt="Download on the App Store"
      width={84}
      height={28}
      className={`block h-7 w-[84px] select-none ${className ?? ''}`}
    />
  );
}

export function DownloadAppCard() {
  const dismissed = useDownloadAppDismissedStore((s) => s.dismissed);
  const setDismissed = useDownloadAppDismissedStore((s) => s.setDismissed);
  const { track } = useAnalytics();

  if (dismissed || userHasApp()) return null;

  // The Superpower app is iOS-only — Android visitors get nothing rather than
  // a dead link to the App Store.
  if (isAndroid()) return null;

  // The card is dismissed only when the user explicitly hits the ✕.
  // Tapping the CTA fires analytics but does not dismiss.
  const onDismiss = () => {
    track('dismissed_app_download');
    setDismissed(true);
  };

  const onClickMobile = () => {
    track('clicked_app_download', { platform: 'mobile' });
  };

  const onQrOpenChange = (open: boolean) => {
    if (open) {
      track('clicked_app_download', { platform: 'desktop' });
    }
  };

  // Layout pulled from Figma:
  //   - Mobile (node 2211:3093, 345×188): badge top-left, phone top-right,
  //     heading + body span below at full-width.
  //   - Desktop (node 2208:1667, ~600×140): phone left, content (heading,
  //     body, badge) stacked in a right column.
  const cardContent = (
    <>
      {/* Phone:
          - Mobile: transparent PNG (alpha mask + bottom fade baked in,
            rendered from Figma node 2211:3531). Anchored top-right.
            z-10 keeps it visually in front of the body text.
          - Desktop: original product shot, anchored 14px from left,
            vertically centered, bleeds slightly past the bottom edge. */}
      <div className="pointer-events-none absolute right-[-12px] top-[-4px] z-10 h-[120px] w-[125px] overflow-visible md:left-[14px] md:right-auto md:top-1/2 md:h-[165px] md:w-[128px] md:-translate-y-1/2 md:overflow-hidden">
        <img
          src="/assets/download-app-cta/iphone-mobile.png"
          alt=""
          aria-hidden="true"
          className="h-full w-auto select-none md:hidden"
          loading="lazy"
        />
        <img
          src="/assets/download-app-cta/iphone.png"
          alt=""
          aria-hidden="true"
          className="hidden select-none md:absolute md:-left-[50px] md:top-[8px] md:block md:h-[152px] md:w-[228px] md:max-w-none"
          loading="lazy"
        />
      </div>

      {/* Content — Figma node 2211:3400 lays this out with left-44px,
          top-66.5px, gap-12px between badge and heading-block. */}
      <div className="relative flex flex-col gap-3 px-[20px] pb-5 pt-[66px] md:gap-3 md:px-0 md:py-[20px] md:pl-[159px] md:pr-12">
        <AppStoreBadge className="self-start md:order-2" />

        <div className="flex flex-col gap-1 md:order-1">
          <p className="text-[20px] font-medium leading-[23px] tracking-[-0.37px] text-white">
            Get the Superpower app
          </p>
          <p className="max-w-[348px] text-[14px] leading-[18px] text-white/60 md:max-w-[330px]">
            All your data in your pocket, sync wearables and text Superpower AI
            anytime.
          </p>
        </div>
      </div>
    </>
  );

  // Sibling of the click target (link or trigger button), not a child —
  // nesting an interactive element inside an <a> or <button> is invalid HTML
  // and confuses assistive tech. z-20 keeps it above the in-card phone (z-10).
  const dismissButton = (
    <button
      type="button"
      aria-label="Dismiss"
      className="absolute right-3 top-3 z-20 inline-flex size-6 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white md:right-4 md:top-4 md:size-7"
      onClick={onDismiss}
    >
      <X className="size-[13px]" />
    </button>
  );

  if (isIOS()) {
    return (
      <div className="relative">
        <a
          aria-label="Get the Superpower app"
          className={CARD_CLASS_NAME}
          style={CARD_STYLE}
          href={APP_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClickMobile}
        >
          {cardContent}
        </a>
        {dismissButton}
      </div>
    );
  }

  return (
    <div className="relative">
      <QrCodeDialog
        onOpenChange={onQrOpenChange}
        trigger={
          <button
            type="button"
            aria-label="Get the Superpower app"
            className={`${CARD_CLASS_NAME} block w-full cursor-pointer text-left`}
            style={CARD_STYLE}
          >
            {cardContent}
          </button>
        }
      />
      {dismissButton}
    </div>
  );
}
