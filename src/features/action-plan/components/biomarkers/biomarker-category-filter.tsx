import { Check, ChevronDown } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useBiomarkerFilterStore } from '@/features/action-plan/stores/biomarker-fiter-store';
import { CATEGORY_OPTIONS } from '@/features/biomarkers/const/toolbar-options';
import { cn } from '@/lib/utils';

interface CategoryFilterProps {
  title?: React.ReactNode;
}

/*
 * NM & UZ Sept 22, 2024
 *
 * Marking this as TECH debt until we implement new approach for data page & tables that can be reusable
 *
 * Should reuse biomarkers/components/biomarker-data-table/biomarker-data-table.tsx
 * */

export function BiomarkerCategoryFilter({
  title = 'Category',
}: CategoryFilterProps): JSX.Element {
  const { selectedCategories, setCategories, clearCategories } =
    useBiomarkerFilterStore();
  const selectedValues = new Set(selectedCategories);

  const toggleCategory = (value: string) => {
    const updatedCategories = selectedValues.has(value)
      ? selectedCategories.filter((category) => category !== value)
      : [...selectedCategories, value];

    setCategories(updatedCategories);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'bg-white rounded-lg py-2 px-3 text-sm text-zinc-500 flex items-center gap-x-1.5 light',
            selectedValues.size > 0 ? 'border-vermillion-700' : 'border-none',
          )}
        >
          <div className="hidden whitespace-nowrap sm:block">
            {selectedValues.size > 0 ? (
              <div className="flex flex-row items-center gap-x-1.5">
                <span className="size-4 rounded-full bg-vermillion-700 text-center text-xs text-white">
                  {selectedValues.size}
                </span>
                <span>Categories</span>
              </div>
            ) : (
              title
            )}
          </div>
          <ChevronDown className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="min-w-[456px] rounded-xl border-0 bg-white p-4 text-sm shadow"
        align="end"
        side="bottom"
      >
        <div className="flex flex-col gap-y-4">
          <div className="flex flex-row items-center justify-between">
            <div>Categories</div>
            <div>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-sm text-gray-400 hover:bg-transparent"
                onClick={clearCategories}
              >
                Clear Selection
              </Button>
            </div>
          </div>
          <div className="grid gap-x-6 gap-y-2.5 md:grid-cols-2">
            {CATEGORY_OPTIONS.map((option) => {
              const isSelected = selectedValues.has(option.value);
              return (
                <div
                  key={option.value}
                  role="presentation"
                  onClick={() => toggleCategory(option.value)}
                  className="my-1 ml-1 mr-2 flex w-full max-w-[200px] cursor-pointer flex-row items-center gap-x-2 truncate"
                >
                  <div
                    className={cn(
                      'flex h-5 w-5 items-center justify-center rounded-sm bg-[#F8FAFC]',
                      isSelected
                        ? 'text-primary-foreground bg-vermillion-100 text-vermillion-700'
                        : '[&_svg]:invisible',
                    )}
                  >
                    <Check className={cn('h-4 w-4')} />
                  </div>
                  <span className="text-gray-500">{option.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
