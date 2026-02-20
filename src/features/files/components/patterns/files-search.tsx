import { SearchIcon } from 'lucide-react';
import React, { forwardRef } from 'react';

import { cn } from '@/lib/utils';

interface FilesSearchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const FilesSearch = forwardRef<HTMLInputElement, FilesSearchProps>(
  ({ value, onChange, ...props }, ref) => {
    return (
      <div
        className={cn(
          'flex w-full flex-col gap-3 md:max-w-[278px]',
          props.className,
        )}
      >
        <div className="relative w-full">
          <SearchIcon
            className={cn(
              'absolute top-1/2 size-4 -translate-y-1/2 transform text-zinc-400 peer-focus:text-zinc-900',
              'left-4',
            )}
          />
          <input
            className="peer w-full rounded-lg border-none bg-zinc-100 px-10 py-2 caret-[#FC5F2B] outline-none outline-offset-0 outline-transparent transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-zinc-600"
            value={value}
            onChange={onChange}
            {...props}
            placeholder={'Search...'}
            ref={ref}
          />
        </div>
      </div>
    );
  },
);

FilesSearch.displayName = 'FilesSearch';

export { FilesSearch };
