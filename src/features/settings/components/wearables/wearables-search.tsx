import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDownWideNarrow, SearchIcon, XIcon } from 'lucide-react';
import React, { forwardRef } from 'react';

import { cn } from '@/lib/utils';

interface WearablesSearchProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  sorted: boolean;
  sortFn: () => void;
}

const WearablesSearch = forwardRef<HTMLInputElement, WearablesSearchProps>(
  ({ value, onChange, sorted, sortFn, ...props }, ref) => {
    return (
      <div className="flex w-full flex-col gap-3">
        <div className="relative w-full">
          <SearchIcon
            className={cn(
              'absolute top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 peer-focus:text-gray-900',
              'left-4',
            )}
          />
          <input
            className="peer w-full rounded-[50px] border-none px-10 py-3 caret-[#FC5F2B] outline-none"
            value={value}
            onChange={onChange}
            {...props}
            placeholder={'Search'}
            ref={ref}
          />
          {value ? (
            <XIcon
              className={cn(
                'absolute top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 peer-focus:text-gray-900 cursor-pointer',
                'right-4',
              )}
              onClick={() =>
                onChange &&
                onChange({
                  target: { value: '' },
                } as React.ChangeEvent<HTMLInputElement>)
              }
            />
          ) : (
            <ArrowDownWideNarrow
              className={cn(
                'absolute top-1/2 transform -translate-y-1/2 h-4 w-4 peer-focus:text-gray-900 cursor-pointer',
                'right-4',
                sorted ? 'text-[#FC5F2B]' : 'text-gray-500',
              )}
              onClick={sortFn}
            />
          )}
        </div>
        <AnimatePresence mode="wait">
          <div className="min-h-[26px]">
            {value ? (
              <motion.h3
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="text-sm text-[#A5A5AE]"
              >{`Showing results for "${value}"`}</motion.h3>
            ) : sorted ? (
              <motion.h3
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="text-sm text-[#A5A5AE]"
              >
                Sorting by most recent
              </motion.h3>
            ) : (
              ''
            )}
          </div>
        </AnimatePresence>
      </div>
    );
  },
);

WearablesSearch.displayName = 'WearablesSearch';

export { WearablesSearch };
