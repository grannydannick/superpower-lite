import { AnimatePresence, m } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';

import { Button } from '@/components/ui/button';

import { type QueuedMessage } from '../../hooks/use-message-queue';

export function QueuedMessages({
  queue,
  onRemove,
}: {
  queue: QueuedMessage[];
  onRemove: (id: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    // Wait for framer-motion height animation to finish before scrolling
    const timeoutId = setTimeout(() => {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }, 150);

    return () => clearTimeout(timeoutId);
  }, [queue.length]);

  if (queue.length === 0) return null;

  return (
    <div className="mx-auto -mb-4 w-full max-w-3xl">
      <div
        ref={scrollRef}
        className="max-h-24 overflow-y-auto rounded-2xl rounded-b-none bg-zinc-100 px-3 py-2 pb-5 scrollbar scrollbar-track-transparent scrollbar-thumb-zinc-300 hover:scrollbar-thumb-zinc-400 md:max-h-52 md:pb-6"
      >
        <AnimatePresence initial={false}>
          {queue.map((msg) => (
            <m.div
              key={msg.id}
              initial={{ opacity: 0, height: 0, y: 8 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -4 }}
              transition={{ duration: 0.1, ease: 'easeOut' }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-2 py-1.5">
                <p className="min-w-0 flex-1 truncate text-sm text-secondary">
                  {msg.text}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onRemove(msg.id)}
                  className="flex aspect-square size-6 shrink-0 items-center justify-center rounded-md p-0 text-zinc-400 transition-colors hover:bg-zinc-200 hover:text-zinc-600"
                >
                  <X size={16} className="shrink-0" />
                </Button>
              </div>
            </m.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
