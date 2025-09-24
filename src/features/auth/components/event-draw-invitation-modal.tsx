import { X } from 'lucide-react';
import React from 'react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { H4, H2 } from '@/components/ui/typography';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';

import { EventDrawRecommendations } from './event-draw-recommendations';

interface EventDrawInvitationModalProps {
  isOpen: boolean;
  onContinue: () => void;
}

export const EventDrawFaq = () => {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger className="text-left">
          <H4>How should I prepare for my event draw?</H4>
        </AccordionTrigger>
        <AccordionContent>
          <ol className="space-y-4 text-secondary">
            <li>
              Fast for 10 hours prior to your event draw time - water only (no
              food or caffeine).
            </li>
            <li>
              Stay well hydrated the day before and morning of your blood draw.
              Multiple tubes will be collected, and good hydration helps ensure
              a smooth process.
            </li>
            <li>
              Avoid alcohol the day before - it can skew your liver enzyme
              results.
            </li>
            <li>
              Skip heavy, fatty foods (like ice cream or coconut cream) the day
              before - they can impact cholesterol readings.
            </li>
            <li>
              Pause Biotin (B7) supplements at least 72 hours before the event
              draw - they may interfere with test accuracy.
            </li>
            <li>
              Take it easy on the day of your draw - avoid strenuous exercise,
              which can temporarily affect results.
            </li>
            <li>You&apos;ll also get this reminder by email - just in case!</li>
          </ol>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger className="text-left">
          <H4>What&apos;s my specific time slot at the event draw?</H4>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4 text-secondary">
            <p>
              Our team will do our best to schedule each member participating in
              the event draw at a specific time and communicate this with you by
              email.
            </p>
            <ul className="ml-4 list-inside list-disc space-y-2">
              <li>Arrive 15 minutes early to check in.</li>
              <li>Allow 15 minutes for the blood draw itself.</li>
            </ul>
            <p>We want to make sure you are not rushing through the process.</p>
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger className="text-left">
          <H4>What if I can no longer make the event?</H4>
        </AccordionTrigger>
        <AccordionContent>
          <ol className="list-inside list-decimal space-y-4 text-secondary">
            <li>
              Need to reschedule? Email concierge@superpower.com and our team
              will help.If you’re in New York, New Jersey, or Arizona, you’ll
              need to schedule an at-home draw, which may include additional
              mandated fees.
            </li>
            <li>
              Running late but on your way? Let us know and we’ll do our best to
              wait for you.
            </li>
          </ol>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export const EventDrawInvitationModal: React.FC<
  EventDrawInvitationModalProps
> = ({ isOpen, onContinue }) => {
  const { width } = useWindowDimensions();

  // Only show modal if it's open
  if (!isOpen) {
    return null;
  }

  if (width <= 768) {
    return (
      <Sheet open={true}>
        <SheetContent className="flex flex-col overflow-hidden rounded-t-2xl">
          <SheetHeader className="pb-0 pt-4">
            <SheetTitle className="ml-6">
              <H2 className="font-bold">You are invited to an event draw</H2>
            </SheetTitle>
            <SheetClose asChild className="-mt-4">
              <div className="flex h-[44px] min-w-[44px] cursor-pointer items-center justify-center rounded-full">
                <X className="h-4 min-w-4" />
              </div>
            </SheetClose>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-12 pb-12">
            <div className="space-y-8">
              <div className="space-y-4">
                <EventDrawRecommendations />
              </div>
              <div className="space-y-4">
                <EventDrawFaq />
              </div>
            </div>
          </div>
          <div className="flex justify-end px-12 pb-12">
            <SheetClose asChild>
              <Button
                variant="default"
                onClick={onContinue}
                className="w-full text-sm"
              >
                Continue
              </Button>
            </SheetClose>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={true}>
      <DialogContent className="gap-2">
        <DialogHeader className="-mt-2 px-12 pb-0">
          <DialogTitle>
            <H2 className="font-bold">You are invited to an event draw</H2>
          </DialogTitle>
          <DialogClose>
            <X className="hidden size-4 cursor-pointer md:block" />
          </DialogClose>
        </DialogHeader>
        <div className="px-12">
          <EventDrawRecommendations />
        </div>
        <div className="px-12">
          <EventDrawFaq />
        </div>
        <DialogFooter className="px-12 py-8">
          <Button onClick={onContinue}>Continue</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
