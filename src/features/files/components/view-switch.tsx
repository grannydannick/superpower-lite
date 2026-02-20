import { LayoutGridIcon, ListIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const ViewSwitch = ({
  view,
  setView,
}: {
  view: 'grid' | 'list';
  setView: (view: 'grid' | 'list') => void;
}) => (
  <div className="relative mr-1 flex gap-3 p-1">
    <div
      className={cn(
        'pointer-events-none absolute inset-0 -ml-[3px] -mt-[3px] h-8 w-8 rounded-[10px] transition-all duration-300',
        view === 'list' && 'translate-x-0',
        view === 'grid' && 'translate-x-[calc(100%-2px)]',
      )}
    >
      <div
        key={view}
        className="animate-grow-shrink-horizontal size-full rounded-[10px] border border-zinc-200 bg-white"
      />
    </div>
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setView('list')}
      className={cn(
        'relative z-10 transition-colors duration-300',
        view === 'list' ? 'text-zinc-500' : 'text-zinc-400',
      )}
    >
      <ListIcon className="size-[18px]" />
    </Button>
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setView('grid')}
      className={cn(
        'relative z-10 transition-colors duration-300',
        view === 'grid' ? 'text-zinc-500' : 'text-zinc-400',
      )}
    >
      <LayoutGridIcon className="size-[18px]" />
    </Button>
  </div>
);
