import NumberFlow from '@number-flow/react';
import { List, ShoppingBag } from 'lucide-react';
import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

import { Body1 } from '@/components/ui/typography';
import { useBiomarkers } from '@/features/biomarkers/api';
import { useProducts } from '@/features/shop/api';
import { useUser } from '@/lib/auth';
import { cn } from '@/lib/utils';

import { usePlan } from '../../api/get-plan';
import { useTableOfContents } from '../../hooks/use-table-of-contents';
import { NotificationDot } from '../notification-dot';

import { TableOfContents } from './table-of-contents';

const Contents = ({
  isOpen,
  setIsOpen,
  planId,
}: {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  planId: string;
}) => {
  const [showContents, setShowContents] = useState(false);
  const [isDelayed, setIsDelayed] = useState<boolean>(false);
  const { scrollPercentage } = useTableOfContents();

  // Contents replicates logic that is being used in @care-plan.tsx and the app provider as tableOfContents needs a fully loaded app in order to render and observe elements
  const userQuery = useUser();
  const planQuery = usePlan({
    id: planId,
    queryConfig: {
      enabled: Boolean(planId) && userQuery.isFetched && isDelayed,
    },
  });

  const productsQuery = useProducts({
    queryConfig: {
      enabled: Boolean(planId) && userQuery.isFetched && isDelayed,
    },
  });
  const biomarkersQuery = useBiomarkers({
    queryConfig: {
      enabled: Boolean(planId) && userQuery.isFetched && isDelayed,
    },
  });

  const isLoading =
    planQuery.isLoading || productsQuery.isLoading || biomarkersQuery.isLoading;

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (userQuery.isFetched) {
      timer = setTimeout(() => {
        setIsDelayed(true);
      }, 1000);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [userQuery.isFetched]);

  return (
    <div
      className={cn(
        'flex flex-col w-full rounded-3xl pointer-events-auto overflow-hidden absolute justify-start border border-zinc-200 bg-white px-4 py-3 shadow-lg transition-all duration-300 ease-in-out',
        isOpen ? 'max-w-64 bottom-28' : 'max-w-12 bottom-0 opacity-0 scale-95',
        showContents ? (isOpen ? 'max-h-[70vh]' : 'max-h-12') : 'max-h-12',
      )}
    >
      <button
        type="button"
        disabled={isLoading}
        onClick={() => setShowContents((v) => !v)}
        className="relative z-10 flex w-full items-center justify-between pb-2"
      >
        <Body1 className="flex items-center gap-1 whitespace-nowrap">
          <span className="truncate">Contents ⋅</span>
          <span className="min-w-[4ch] shrink-0 text-left">
            <NumberFlow value={scrollPercentage} suffix="%" />
          </span>
        </Body1>
        <List className="size-5 shrink-0 text-zinc-500" />
      </button>
      <button
        className={cn(
          'transition-all overflow-y-auto scrollbar-none',
          isOpen && 'delay-75',
          showContents ? 'max-h-[70vh]' : 'max-h-0 opacity-0 overflow-hidden',
        )}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(false);
        }}
      >
        <div>{!isLoading && <TableOfContents />}</div>
      </button>
    </div>
  );
};

export const FloatingMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { id } = useParams();
  const planId = id ?? '';
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setSearchParams] = useSearchParams();

  const handleProtocolItemsClick = () => {
    setSearchParams((params) => {
      params.set('modal', 'checkout');
      return params;
    });
  };

  return (
    <div className="pointer-events-none relative z-10 ml-auto flex w-full flex-col items-end justify-end lg:hidden">
      <Contents isOpen={isOpen} setIsOpen={setIsOpen} planId={planId} />
      <NotificationDot
        className={cn(
          isOpen ? 'bottom-24' : 'bottom-10',
          'transition-all z-50 -translate-x-1 absolute',
        )}
      />
      <button
        onClick={handleProtocolItemsClick}
        className={cn(
          'flex w-full h-12 pointer-events-auto overflow-hidden absolute items-center justify-between rounded-full border border-zinc-200 bg-white px-4 py-3 shadow-lg duration-200 transition-all ease-in-out',
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
