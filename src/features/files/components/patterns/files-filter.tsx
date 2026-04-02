import { useWindowWidth } from '@wojtekmaj/react-hooks';
import { ChevronDown } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown';
import { cn } from '@/lib/utils';
import { File } from '@/types/api';

export type FilterType =
  | File['contentType']
  | 'media'
  | 'extraction:final'
  | 'extraction:processing';

/**
 * FilesFilter is filtering different types of files
 * It is a dropdown menu that allows you to filter by file type
 */
export const FilesFilter = ({
  filter,
  setFilter,
  types,
}: {
  filter: { name: string; type: FilterType } | false;
  setFilter: (filter: { name: string; type: FilterType } | false) => void;
  types: { name: string; type: FilterType }[];
}) => {
  const width = useWindowWidth();
  const isMobile = width && width < 768;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={types.length === 0}>
        <span
          className={cn(
            'group flex cursor-pointer items-center gap-1.5 truncate text-sm text-zinc-400 transition-all data-[state=open]:text-zinc-500 hover:text-zinc-500',
            types.length === 0 && 'cursor-not-allowed',
          )}
        >
          {filter ? filter?.name : 'All Files'}
          <ChevronDown className="size-[15px] shrink-0 transition-transform group-data-[state=open]:rotate-180" />
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={isMobile ? 'start' : 'end'}
        className="w-[160px] rounded-[16px] border-zinc-100"
      >
        <DropdownMenuItem onClick={() => setFilter(false)}>
          All Files
        </DropdownMenuItem>
        {types.map((type) => (
          <DropdownMenuItem
            key={type.type}
            onClick={() => setFilter({ name: type.name, type: type.type })}
          >
            {type.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
