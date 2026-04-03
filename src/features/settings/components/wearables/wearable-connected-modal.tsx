import { IconMagnifyingGlass } from '@central-icons-react/round-filled-radius-2-stroke-1.5/IconMagnifyingGlass';
import { IconNotes } from '@central-icons-react/round-filled-radius-2-stroke-1.5/IconNotes';
import { IconSparklesTwo } from '@central-icons-react/round-filled-radius-2-stroke-1.5/IconSparklesTwo';
import { X } from 'lucide-react';
import { type ComponentType, type SVGProps, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';

const INFO_ITEMS: {
  icon: ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;
  text: string;
}[] = [
  {
    icon: IconMagnifyingGlass,
    text: 'Your wearables data is live in your data page',
  },
  {
    icon: IconSparklesTwo,
    text: 'Superpower AI has full context of your wearables data',
  },
  {
    icon: IconNotes,
    text: 'Your protocol will connect the dots',
  },
];

export function WearableConnectedModal({
  providerName,
  open,
  onOpenChange,
  onGenerateReport,
}: {
  providerName: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerateReport: () => void;
}) {
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Auto-dismiss 3 seconds after showing confirmation
  useEffect(() => {
    if (!showConfirmation) return;
    const timer = setTimeout(() => {
      onOpenChange(false);
      setShowConfirmation(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, [showConfirmation, onOpenChange]);

  // Reset confirmation state when modal opens
  useEffect(() => {
    if (open) {
      setShowConfirmation(false);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="z-[99] max-w-[calc(100%-1rem)] overflow-hidden rounded-3xl p-0 outline -outline-offset-1 outline-white/10 xs:max-w-md">
        <DialogTitle className="sr-only">
          Your {providerName} is connected
        </DialogTitle>

        {/* Hero image */}
        <div className="relative">
          <img
            src="/integrations/runner.webp"
            alt=""
            className="h-56 w-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white to-transparent" />
          <DialogClose className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full text-white transition-colors hover:bg-black/20">
            <X className="size-4" />
          </DialogClose>
        </div>

        {/* Content */}
        <div className="space-y-6 px-6 pb-6">
          <h2 className="text-center text-2xl font-semibold">
            Your {providerName} is connected!
          </h2>

          <div className="space-y-4">
            {INFO_ITEMS.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <Icon className="size-6 shrink-0 rounded-full bg-vermillion-900/10 p-1 text-vermillion-900" />
                <span className="text-sm text-zinc-700">{text}</span>
              </div>
            ))}
          </div>

          {showConfirmation ? (
            <p className="text-center text-sm text-zinc-500">
              We're generating your insights and we'll let you know when your
              report is ready.
            </p>
          ) : (
            <Button
              className="w-full rounded-xl"
              onClick={() => {
                onGenerateReport();
                setShowConfirmation(true);
              }}
            >
              Generate my report
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
