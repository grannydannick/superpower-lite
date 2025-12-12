import { ListFilterIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown';
import {
  MARKETPLACE_FILTER_OPTIONS,
  MarketplaceFilter,
  MarketplaceTabValue,
} from '@/features/marketplace/const/categories';
import { getFilterDisplayLabel } from '@/features/marketplace/utils/category-utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

type MarketplaceFiltersProps = {
  activeTab: MarketplaceTabValue;
  value: MarketplaceFilter;
  onChange: (value: MarketplaceFilter) => void;
};

const getFilterLabel = (
  option: MarketplaceFilter,
  activeTab: MarketplaceTabValue,
) => getFilterDisplayLabel(option, activeTab);

export const MarketplaceFilters = ({
  activeTab,
  value,
  onChange,
}: MarketplaceFiltersProps) => {
  const isMobile = useIsMobile();
  const PILL_OPTIONS: MarketplaceFilter[] = [
    'all',
    'METABOLIC_HEALTH',
    'GUT_HEALTH',
    'HEART_HEALTH',
  ];

  const DROPDOWN_OPTIONS = MARKETPLACE_FILTER_OPTIONS.filter(
    (opt) => !PILL_OPTIONS.includes(opt),
  );

  const isFilterActive = DROPDOWN_OPTIONS.includes(value);

  return (
    <div className="relative">
      <div className="flex flex-nowrap items-center gap-1 overflow-x-auto pr-8 md:flex-wrap md:overflow-visible md:pr-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              size={isMobile ? 'small' : 'medium'}
              variant={isFilterActive ? 'default' : 'outline'}
              className={cn(
                'space-x-2.5 rounded-full border shadow-none transition-colors',
                isFilterActive
                  ? 'border-primary'
                  : 'border-input text-secondary',
              )}
            >
              <ListFilterIcon className="-mt-0.5 size-4" />
              <span>Filters</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-[220px] rounded-[16px] border-zinc-100"
          >
            {DROPDOWN_OPTIONS.map((option) => (
              <DropdownMenuCheckboxItem
                key={option}
                checked={value === option}
                onCheckedChange={(checked) => {
                  if (checked) {
                    onChange(option);
                  } else {
                    onChange('all');
                  }
                }}
                className="rounded-lg"
              >
                {getFilterLabel(option, activeTab)}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="relative mx-2 mt-0.5 h-5 w-px bg-zinc-200" />
        {PILL_OPTIONS.map((option) => {
          const isActive = value === option;

          return (
            <Button
              key={option}
              type="button"
              size={isMobile ? 'small' : 'medium'}
              variant={isActive ? 'default' : 'outline'}
              className={cn(
                'shrink-0 whitespace-nowrap rounded-full border shadow-none transition-colors',
                isActive ? 'border-primary' : 'border-input text-secondary',
              )}
              aria-pressed={isActive}
              onClick={() => {
                if (option === 'all') {
                  onChange('all');
                } else if (!isActive) {
                  onChange(option);
                }
              }}
            >
              {getFilterLabel(option, activeTab)}
            </Button>
          );
        })}
      </div>
    </div>
  );
};
