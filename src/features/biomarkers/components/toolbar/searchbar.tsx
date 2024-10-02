import { Table } from '@tanstack/react-table';
import { Search } from 'lucide-react';
import * as React from 'react';

import { Input } from '@/components/ui/input';

function SearchBar<TData>(props: { table: Table<TData> }) {
  const table = props.table;

  return (
    <div className="flex w-full items-center gap-2">
      <Search className="size-5 text-zinc-400" />
      <Input
        placeholder="Search"
        value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
        onChange={(event) =>
          table.getColumn('name')?.setFilterValue(event.target.value.toString())
        }
        className="
          w-full
          rounded-md
          border-0
          border-transparent
          bg-transparent
          px-0
          py-1.5
          text-base
          leading-[20px]
          text-zinc-500
          caret-vermillion-700
          shadow-none
          placeholder:text-gray-400
          focus-visible:border-transparent
          focus-visible:bg-transparent
          focus-visible:outline-transparent
          focus-visible:ring-0
          focus-visible:ring-offset-0
          "
      />
    </div>
  );
}

export default SearchBar;
