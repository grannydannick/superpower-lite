import qrSvg from '/data/superpower-qr.svg?raw';
import { ArrowRight, X } from 'lucide-react';
import { type ReactNode } from 'react';

import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';

function QrCodeAnimated() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-zinc-100 p-1 shadow-lg">
      <div
        className="size-52 [&_svg]:size-full"
        dangerouslySetInnerHTML={{ __html: qrSvg }}
      />
      {/* Single performant shimmer overlay */}
      <div
        className="pointer-events-none absolute inset-0 animate-[qr-shimmer_3s_ease-in-out_infinite]"
        style={{
          background:
            'radial-gradient(circle 80px, rgba(255,255,255,0.45) 0%, transparent 100%)',
        }}
      />
    </div>
  );
}

function QrDialogBody() {
  return (
    <div className="flex flex-col items-center gap-6 px-6 py-10">
      <div className="space-y-2 text-center">
        <h3 className="text-xl font-semibold">
          Scan the QR code to download Superpower on iOS.
        </h3>
        <p className="text-sm text-zinc-400">
          Get personalised insights from your wearables data.
        </p>
      </div>
      <QrCodeAnimated />
      <p className="text-sm text-zinc-400">Coming soon to Android.</p>
    </div>
  );
}

/** Reusable wrapper – renders a Dialog (desktop) or Sheet (mobile) with the QR code content. */
export function QrCodeDialog({ trigger }: { trigger: ReactNode }) {
  const { width } = useWindowDimensions();
  const isMobile = width <= 1024;

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>{trigger}</SheetTrigger>
        <SheetContent className="flex flex-col items-center rounded-t-3xl p-4 pt-7">
          <SheetClose asChild className="absolute right-2 top-2 z-10">
            <div className="flex h-[44px] min-w-[44px] cursor-pointer items-center justify-center rounded-full">
              <X className="h-4 min-w-4 text-secondary" />
            </div>
          </SheetClose>
          <QrDialogBody />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-sm rounded-3xl p-0">
        <DialogTitle className="sr-only">Download Superpower</DialogTitle>
        <QrDialogBody />
        <DialogClose />
      </DialogContent>
    </Dialog>
  );
}

export function MobileAppBanner() {
  return (
    <QrCodeDialog
      trigger={
        <Card className="group flex cursor-pointer items-center gap-4 px-4 py-2">
          <img
            src="/announcements/mobile-data-app.webp"
            alt="Wearables"
            className="size-16 object-cover pt-1 rounded-mask"
          />
          <span className="flex flex-1 flex-col items-start p-4 pl-2">
            <span className="text-sm text-vermillion-900">
              Your health data, always up to date
            </span>
            <span className="flex-1 text-balance text-left font-medium text-primary">
              Download our mobile app to connect Apple Health and other
              wearables. Your data syncs automatically so your recommendations
              stay current.
            </span>
          </span>
          <ArrowRight className="size-4 shrink-0 text-zinc-400 transition-all group-hover:translate-x-0.5 group-hover:text-zinc-700" />
        </Card>
      }
    />
  );
}
