import NumberFlow from '@number-flow/react';
import { List, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { Body1 } from '@/components/ui/typography';
import { cn } from '@/lib/utils';

import { useTableOfContents } from '../../hooks/use-table-of-contents';
import { NotificationDot } from '../notification-dot';

import { TableOfContents } from './table-of-contents';

const Contents = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}) => {
  const [showContents, setShowContents] = useState(false);
  const { scrollPercentage } = useTableOfContents();

  return (
    <button
      onClick={() => setShowContents(!showContents)}
      className={cn(
        'flex flex-col w-full rounded-3xl pointer-events-auto overflow-hidden absolute right-4 justify-start border border-zinc-200 bg-white px-4 py-3 shadow-lg transition-all duration-300 ease-in-out',
        isOpen
          ? 'max-w-64 bottom-28 delay-75'
          : 'max-w-12 bottom-0 opacity-0 scale-95',
        showContents ? (isOpen ? 'h-48' : 'h-12') : 'h-12',
      )}
    >
      <div className="relative z-10 flex w-full items-center justify-between pb-2">
        <Body1 className="flex items-center gap-1 whitespace-nowrap">
          <span className="truncate">Contents ⋅</span>
          <span className="min-w-[4ch] shrink-0 text-left">
            <NumberFlow value={scrollPercentage} suffix="%" />
          </span>
        </Body1>
        <List className="size-5 shrink-0 text-zinc-500" />
      </div>
      <button
        onClick={() => setIsOpen(false)}
        className={cn(
          'transition-all overflow-y-auto scrollbar-none',
          showContents ? 'h-56' : 'h-0 opacity-0 overflow-hidden',
        )}
      >
        <TableOfContents />
      </button>
    </button>
  );
};

export const FloatingMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setSearchParams] = useSearchParams();

  const handleProtocolItemsClick = () => {
    setSearchParams((params) => {
      params.set('modal', 'checkout');
      return params;
    });
  };

  return (
    <div className="pointer-events-none sticky bottom-20 z-10 ml-auto flex w-full flex-col items-end justify-end px-4 lg:hidden">
      <Contents isOpen={isOpen} setIsOpen={setIsOpen} />
      <NotificationDot
        className={cn(
          isOpen ? 'bottom-24' : 'bottom-10',
          'transition-all z-50 -translate-x-1 absolute',
        )}
      />
      <button
        onClick={handleProtocolItemsClick}
        className={cn(
          'flex w-full h-12 pointer-events-auto overflow-hidden absolute items-center right-4 justify-between rounded-full border border-zinc-200 bg-white px-4 py-3 shadow-lg duration-200 transition-all ease-in-out',
          isOpen
            ? 'max-w-64 bottom-14'
            : 'max-w-12 bottom-0 opacity-0 scale-95 delay-75',
        )}
      >
        <Body1 className="line-clamp-1">Get protocol items</Body1>
        <ShoppingBag className="size-5 shrink-0 text-zinc-500" />
      </button>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="pointer-events-auto relative z-40 size-12 rounded-full border border-zinc-200 bg-white p-1 shadow-lg transition-all duration-150 hover:bg-zinc-50 active:scale-[.99]"
      >
        <span
          className={cn(
            'absolute left-1/2 top-1/2 h-0.5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black transition-all',
            isOpen ? '-rotate-45 mt-0' : 'rotate-0 -mt-1.5',
          )}
        />
        <span
          className={cn(
            'absolute transition-all left-1/2 top-1/2 h-0.5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black',
            isOpen ? 'rotate-45' : 'rotate-0',
          )}
        />
        <span
          className={cn(
            'absolute justify-between transition-all left-1/2 top-1/2 flex h-0.5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full',
            isOpen ? 'max-w-0 opacity-0 mt-0' : 'max-w-5 mt-1.5',
          )}
        >
          {Array.from({ length: 3 }, (_, i) => (
            <span
              key={i}
              className="size-[3px] shrink-0 rounded-full bg-black"
            />
          ))}
        </span>
      </button>
    </div>
  );
};
