import { XIcon } from 'lucide-react';
import { useCallback, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent } from '@/components/ui/dialog';
import { Body1, H3 } from '@/components/ui/typography';
import { AnimatedIcon } from '@/features/messages/components/ai/animated-icon';

const INFO_DIALOG_COOKIE = 'ai_chat:dialog_dismissed';
const INFO_DIALOG_MAX_AGE = 60 * 60 * 24 * 365 * 10; // 10 year in seconds

export const InfoDialog = () => {
  // on first render, hide if our cookie exists
  const getInitial = () => {
    if (typeof document === 'undefined') return true;
    return !document.cookie
      .split('; ')
      .some((c) => c.startsWith(`${INFO_DIALOG_COOKIE}=`));
  };

  const [_open, _setOpen] = useState(getInitial);
  const setOpen = useCallback(
    (value: boolean | ((prev: boolean) => boolean)) => {
      const next = typeof value === 'function' ? value(_open) : value;
      // write the cookie whenever the dialog is dismissed
      document.cookie = [
        `${INFO_DIALOG_COOKIE}=${next ? '' : '1'}`,
        `path=/`,
        `max-age=${INFO_DIALOG_MAX_AGE}`,
      ].join('; ');
      _setOpen(next);
    },
    [_open],
  );

  return (
    <Dialog open={_open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogClose asChild>
          <Button
            variant="ghost"
            className="absolute right-3 top-3 text-zinc-500"
          >
            <XIcon size={16} />
          </Button>
        </DialogClose>
        <div className="flex flex-col gap-2 p-8">
          <AnimatedIcon state="idle" size={64} className="mx-auto mb-4" />
          <H3 className="text-balance text-center">
            Welcome to Superpower&apos;s AI Health Advocate
          </H3>
          <Body1 className="mb-11 text-center text-secondary">
            This AI health advisor is newly experimental and you have early
            access, please give us feedback on any responses so that we can
            refine the product to be the best for you!
          </Body1>
          <Button
            variant="default"
            className="w-full rounded-full"
            onClick={() => setOpen(false)}
          >
            Message AI Health Advocate
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
