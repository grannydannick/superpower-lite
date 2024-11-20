import { Table } from '@tanstack/react-table';
import { X } from 'lucide-react';
import React from 'react';

import { ToolbarCategoryType } from '@/features/biomarkers/types/filters';

import CategoryBar from './category-bar';
import CategoryFilter from './category-filter';
import MobileFilter from './mobile-filter';
import SearchBar from './searchbar';
import StatusFilter from './status-filter';

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  setCurrentCategory: (category: ToolbarCategoryType) => void;
  currentCategory: string | undefined;
}

export function BiomarkerDataTableToolbar<TData>({
  table,
  setCurrentCategory,
  currentCategory,
}: DataTableToolbarProps<TData>): JSX.Element {
  const value = table.getColumn('name')?.getFilterValue() as string;
  const isBloodCategory =
    currentCategory?.toLowerCase() === 'Blood'.toLowerCase();

  return (
    <div className="w-full">
      <div className="mx-auto h-full">
        <div className="rounded-t-2xl bg-white">
          <CategoryBar
            currentCategory={currentCategory}
            setCurrentCategory={setCurrentCategory}
          />
        </div>
        <div className="relative h-14 w-full rounded-b-2xl bg-[rgb(255_255_255_/_0.69)] px-4 shadow-sm">
          <div className="mx-auto flex h-full max-w-[100rem] items-center">
            <SearchBar table={table} />
            {isBloodCategory && (
              <div className="hidden flex-row items-center gap-x-3 md:flex">
                <StatusFilter table={table} />
                <CategoryFilter table={table} />
              </div>
            )}
            <div className="md:hidden">
              {value ? (
                <div
                  role="presentation"
                  onClick={() => table.getColumn('name')?.setFilterValue('')}
                >
                  <X className="size-5 cursor-pointer text-[#A1A1AA]" />
                </div>
              ) : (
                isBloodCategory && <MobileFilter table={table} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
