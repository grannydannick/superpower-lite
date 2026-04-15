import { m } from 'framer-motion';
import { XIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';

interface SingleThreadIntroDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SingleThreadIntroDialog({
  open,
  onOpenChange,
}: SingleThreadIntroDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90%] overflow-hidden p-0 sm:max-w-lg">
        <DialogClose asChild>
          <Button
            variant="ghost"
            className="absolute right-3 top-3 z-10 text-zinc-500"
          >
            <XIcon size={16} />
            <span className="sr-only">Close</span>
          </Button>
        </DialogClose>

        <div className="pb-8 pt-16">
          <ThreadAnimation />
        </div>

        <div className="flex flex-col gap-2 px-8 pb-8 pt-4">
          <DialogTitle className="text-balance text-center text-xl font-normal tracking-[-0.48px] text-zinc-900 md:text-2xl">
            Your new AI experience
          </DialogTitle>
          <DialogDescription className="mb-4 text-center text-base text-secondary">
            All your conversations are now in one place. No more switching
            between threads.
          </DialogDescription>
          <Button
            variant="default"
            className="w-full rounded-full"
            onClick={() => onOpenChange(false)}
          >
            Got it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ── Animation ─────────────────────────────────────────────────────── */

const ITEMS = [
  { chatWidth: '75%', align: 'self-start', bg: 'bg-zinc-200' },
  { chatWidth: '45%', align: 'self-end', bg: 'bg-zinc-100' },
  { chatWidth: '60%', align: 'self-start', bg: 'bg-zinc-200' },
  { chatWidth: '35%', align: 'self-end', bg: 'bg-zinc-100' },
];

const CYCLE = 7; // total loop duration in seconds
const STAGGER = 0.6; // seconds between each item migration
const FIRST = 1.2; // delay before the first item moves
const FADE = 0.35; // per-item transition duration

/** Normalise seconds → 0-1 within the cycle */
const t = (s: number) => s / CYCLE;

// Derived landmarks
const LAST_ITEM_END = FIRST + (ITEMS.length - 1) * STAGGER + FADE; // ~3.35
const SIDEBAR_GONE = LAST_ITEM_END + 0.45; // ~3.8
const HOLD_END = 5.5;
const RESET_DONE = 6.5;

/** Slight overshoot for a spring-like feel (used on width only, not opacity) */
const SPRING_EASE = [0.22, 1.15, 0.36, 1] as const;
const SPRING_REPEAT = { repeat: Infinity, ease: SPRING_EASE };
const SMOOTH_REPEAT = { repeat: Infinity, ease: 'easeInOut' as const };

function ThreadAnimation() {
  return (
    <div className="mx-auto max-w-[320px] px-4 pb-4 pt-2">
      <div className="flex h-[140px]">
        {/* ── Sidebar wrapper — animates total width so it takes zero space when collapsed ── */}
        <m.div
          animate={{
            width: [88, 88, 0, 0, 0, 88],
          }}
          transition={{
            duration: CYCLE,
            times: [
              0,
              t(LAST_ITEM_END),
              t(SIDEBAR_GONE),
              t(HOLD_END),
              t(RESET_DONE),
              1,
            ],
            ...SPRING_REPEAT,
          }}
          className="shrink-0 overflow-hidden"
        >
          <div className="mr-2 flex h-full w-[80px] flex-col gap-1.5 rounded-xl border border-zinc-200 bg-white px-2 py-2.5 shadow-lg shadow-black/[.03]">
            {ITEMS.map((_, i) => {
              const hide = t(FIRST + i * STAGGER);
              const hidden = t(FIRST + i * STAGGER + FADE);
              return (
                <m.div
                  key={`s-${i}`}
                  animate={{
                    opacity: [1, 1, 0, 0, 1],
                    height: [8, 8, 0, 0, 8],
                  }}
                  transition={{
                    duration: CYCLE,
                    times: [0, hide, hidden, t(RESET_DONE), 1],
                    ...SMOOTH_REPEAT,
                  }}
                  className="w-full shrink-0 rounded-full bg-zinc-200"
                />
              );
            })}
          </div>
        </m.div>

        {/* ── Chat panel ── */}
        <div className="flex flex-1 items-end justify-center overflow-hidden rounded-xl border border-zinc-200 bg-white p-3 shadow-lg shadow-black/[.03]">
          <div className="flex w-full max-w-[140px] flex-col">
            {/* Static base messages */}
            <div className="mb-2 h-2.5 w-3/4 self-start rounded-full bg-zinc-200" />
            <div className="h-2.5 w-1/2 self-end rounded-full bg-zinc-100" />

            {/* Items migrating in from sidebar */}
            {ITEMS.map((item, i) => {
              const show = t(FIRST + i * STAGGER);
              const shown = t(FIRST + i * STAGGER + FADE);
              return (
                <m.div
                  key={`c-${i}`}
                  animate={{
                    opacity: [0, 0, 1, 1, 0, 0],
                    height: [0, 0, 10, 10, 0, 0],
                    marginTop: [0, 0, 8, 8, 0, 0],
                  }}
                  transition={{
                    duration: CYCLE,
                    times: [0, show, shown, t(HOLD_END), t(HOLD_END + 0.5), 1],
                    ...SMOOTH_REPEAT,
                  }}
                  className={`shrink-0 rounded-full ${item.bg} ${item.align}`}
                  style={{ width: item.chatWidth }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
