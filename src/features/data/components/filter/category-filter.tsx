import { ChevronDownIcon, ListChecks, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { AnimatedCheckbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown';
import { Body1 } from '@/components/ui/typography';

import { useDataSummary } from '../../api/get-data-summary';
import { useDataFilterStore } from '../../stores/data-filter-store';

export const CategoryFilter = () => {
  const { selectedCategories, updateCategories, clearCategories } =
    useDataFilterStore();
  const { data: categories } = useDataSummary();

  const handleClear = () => {
    clearCategories();
  };

  const handleCategoryClick = (category: string) => {
    const isSelected = selectedCategories.includes(category);
    if (isSelected) {
      updateCategories(selectedCategories.filter((id) => id !== category));
    } else {
      updateCategories([...selectedCategories, category]);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-10 gap-2 px-4 text-zinc-500">
          <ListChecks className="size-4 xs:hidden" />
          <Body1 className="hidden text-neutral-500 xs:block">Category</Body1>
          <ChevronDownIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="grid max-h-96 gap-0.5 overflow-y-auto scrollbar-none xs:grid-cols-3">
        <div className="flex w-full justify-between gap-4 px-4 py-2 xs:col-span-3">
          <Body1>Categories</Body1>
          <Button
            onClick={handleClear}
            variant="ghost"
            size="icon"
            className="flex items-center gap-1 text-zinc-400"
          >
            <X className="mb-0.5 size-4" />
            Clear
          </Button>
        </div>
        {categories?.categories.map((category) => (
          <DropdownMenuItem
            key={category.slug}
            className="group flex items-center gap-3"
            onSelect={(e) => e.preventDefault()}
            onClick={() => handleCategoryClick(category.slug)}
          >
            <AnimatedCheckbox
              className="border-none bg-zinc-100 transition-colors duration-300 group-hover:bg-zinc-200 data-[state=checked]:!bg-vermillion-900"
              checked={selectedCategories.includes(category.slug)}
            />
            <Body1>{category.title}</Body1>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
