import { IconClock } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconClock';
import type React from 'react';
import { forwardRef, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Body2, H4 } from '@/components/ui/typography';
import { CreateMessageForm } from '@/features/messages/components/create-message-form';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';
import { cn } from '@/lib/utils';

export const CareTeamDialog = ({
  open: openProp,
  onOpenChange,
  trigger,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = openProp !== undefined;
  const open = isControlled ? (openProp as boolean) : internalOpen;
  const setOpen = (v: boolean) => {
    onOpenChange?.(v);
    if (!isControlled) setInternalOpen(v);
  };

  const { width } = useWindowDimensions();
  const isMobile = useMemo(() => width <= 768, [width]);

  const content = () => (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 px-4 pt-4">
        <div className="space-y-2.5">
          <div className="space-y-1">
            <H4>Ask your care team</H4>
            <Body2 className="text-zinc-400">
              Complex topics and customer service
            </Body2>
          </div>
          <div className="flex items-center gap-2">
            <IconClock className="mb-0.5 text-zinc-400" size={16} />
            <Body2 className="line-clamp-1 text-zinc-400">{`<24h on weekdays`}</Body2>
          </div>
        </div>
        <div className="flex -space-x-2">
          <img
            className="size-8 min-w-8 rounded-full border-2 border-white object-cover"
            src="/services/doctors/doc_1.webp"
            alt="Superpower Concierge Doctor 1"
          />
          <img
            className="size-8 min-w-8 rounded-full border-2 border-white object-cover"
            src="/services/doctors/doc_2.webp"
            alt="Superpower Concierge Doctor 2"
          />
          <img
            className="size-8 min-w-8 rounded-full border-2 border-white object-cover"
            src="/services/doctors/doc_3.webp"
            alt="Superpower Concierge Doctor 3"
          />
        </div>
      </div>
      <CreateMessageForm />
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>{trigger ? trigger : <Trigger />}</SheetTrigger>
        <SheetContent className="flex max-h-[85vh] flex-col gap-0 rounded-t-2xl p-0">
          <div className="gap-8 p-3 pt-2">{content()}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger ? trigger : <Trigger />}</DialogTrigger>
      <DialogContent className="gap-8 p-3 pt-2 sm:max-w-lg">
        <DialogHeader className="sr-only p-0">
          <DialogTitle className="text-xl">Ask your care team</DialogTitle>
        </DialogHeader>
        {content()}
      </DialogContent>
    </Dialog>
  );
};

const Trigger = forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof Button>
>(({ className, ...props }, ref) => (
  <Button
    ref={ref}
    variant="ghost"
    className={cn(
      'gap-3 py-2 pl-4 hover:bg-zinc-100 hover:text-primary',
      className,
    )}
    {...props}
  >
    <img
      className="size-5 rounded-full object-cover"
      src="/services/doctors/doc_1.webp"
      alt="Superpower Concierge Doctor 1"
    />
    Care team
  </Button>
));

Trigger.displayName = 'Trigger';
