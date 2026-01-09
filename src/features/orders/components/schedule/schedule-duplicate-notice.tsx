import { XIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';
import { Body1, H3 } from '@/components/ui/typography';

import { useScheduleDuplicate } from '../../hooks/use-schedule-duplicate';
import { useScheduleStore } from '../../stores/schedule-store';

import { useScheduleFlowStepper } from './schedule-stepper';

export const ScheduleDuplicateNotice = () => {
  const [open, setOpen] = useState(true);
  const slot = useScheduleStore((s) => s.slot);
  const { nearestMatchingDupe, dupeDate } = useScheduleDuplicate();
  const { next } = useScheduleFlowStepper();

  const close = () => setOpen(false);

  const slotKey = useMemo(
    () => (slot?.start ? new Date(slot.start).toISOString() : null),
    [slot],
  );

  useEffect(() => {
    if (slotKey && nearestMatchingDupe) setOpen(true);
  }, [slotKey, nearestMatchingDupe]);

  if (!nearestMatchingDupe) return null;

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-[95vw] p-8 sm:max-w-[525px]">
        <DialogClose asChild className="absolute right-6 top-6">
          <Button
            onClick={close}
            variant="ghost"
            size="icon"
            className="rounded-full"
          >
            <XIcon className="size-4 text-zinc-500 transition-colors duration-200 hover:text-zinc-600" />
          </Button>
        </DialogClose>
        <div>
          <div className="relative h-48 w-full overflow-hidden">
            <img
              src="/services/upgrade/baseline-panel.png"
              alt="panel"
              className="pointer-events-none mx-auto h-[180px] w-full select-none object-contain pt-4"
            />
            <div className="absolute bottom-0 h-20 w-full bg-gradient-to-b from-transparent via-white/75 to-white" />
          </div>
          <div className="mb-8 flex flex-col gap-1.5">
            <H3 className="text-center">Similar test already scheduled</H3>
            <Body1 className="text-center text-secondary">
              This panel measures biomarkers that are similar to a test you have
              already scheduled{' '}
              {nearestMatchingDupe?.startTimestamp ? ` on ${dupeDate}` : ''}. We
              recommend scheduling these blood draws at least 1 month apart so
              you have time in between tests to see trends.
            </Body1>
          </div>
          <div className="flex flex-col gap-2">
            <Button onClick={close}>Schedule Later</Button>
            <Button variant="outline" onClick={next}>
              Ignore and Continue
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
