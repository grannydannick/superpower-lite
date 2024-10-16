import { ChevronRight, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Body1, Body2, H1 } from '@/components/ui/typography';
import { MeetTeamAccordion } from '@/features/messages/components/meet-team-accordion';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';

const MobileTrigger = () => {
  return (
    <SheetTrigger asChild>
      <Button
        className="h-14 bg-white text-zinc-400 lg:hidden"
        variant="outline"
      >
        Meet your team
      </Button>
    </SheetTrigger>
  );
};

const DesktopTrigger = () => {
  return (
    <div className="hidden h-[148px] w-full max-w-60 flex-col gap-4 rounded-[20px] border border-zinc-200 bg-white p-5 lg:flex">
      <img
        className="size-12 min-w-12 rounded-xl object-cover"
        src="/services/1-1_advisory_call.png"
        alt="longevity-team"
      />
      <div>
        <Body1>Meet your longevity team</Body1>
        <SheetTrigger asChild>
          <Button variant="ghost" className="gap-1 p-0">
            <Body2 className="text-zinc-400">Learn more</Body2>
            <ChevronRight className="size-3 text-zinc-400" />
          </Button>
        </SheetTrigger>
      </div>
    </div>
  );
};

export const MeetTeamDialog = () => {
  const { width } = useWindowDimensions();

  if (width <= 1023) {
    return (
      <Sheet>
        <MobileTrigger />

        <SheetContent className="flex h-full flex-col rounded-t-[10px]">
          <div className="flex items-center justify-between px-8 pt-16">
            <SheetClose>
              <div className="flex h-[44px] min-w-[44px] items-center justify-center rounded-full bg-zinc-100 ">
                <X className="h-4 min-w-4" />
              </div>
            </SheetClose>
            <Body1>Meet your team</Body1>
            <div className="min-w-[44px]" />
          </div>
          <div className="overflow-auto">
            <H1 className="px-8 pb-12 pt-9">Meet your longevity team</H1>
            <MeetTeamAccordion />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet>
      <DesktopTrigger />

      <SheetContent side="right" className="w-[584px] sm:max-w-none">
        <SheetHeader className="flex-row items-center justify-between space-y-0 px-14 pt-6">
          <Body1 className="text-zinc-400">Meet your team</Body1>
          <SheetClose>
            <X className="size-[18px] min-w-[18px] text-zinc-400" />
          </SheetClose>
        </SheetHeader>
        <H1 className="p-14">Meet your longevity team</H1>
        <MeetTeamAccordion />
      </SheetContent>
    </Sheet>
  );
};
