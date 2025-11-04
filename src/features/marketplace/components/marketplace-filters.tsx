import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const MARKETPLACE_FILTER_LABELS = {
  all: {
    all: 'All products',
    tests: 'All tests',
    supplements: 'All supplements',
    prescriptions: 'All prescriptions',
    orders: 'All orders',
  },
} as const;

export const MARKETPLACE_FILTER_OPTIONS = [
  'all',
  'Metabolic health',
  'Gut health',
  'Heart health',
] as const;

export type MarketplaceFilter = (typeof MARKETPLACE_FILTER_OPTIONS)[number];

export type MarketplaceTabValue =
  | 'all'
  | 'tests'
  | 'supplements'
  | 'prescriptions'
  | 'orders';

type MarketplaceFiltersProps = {
  activeTab: MarketplaceTabValue;
  value: MarketplaceFilter;
  onChange: (value: MarketplaceFilter) => void;
};

const getFilterLabel = (
  option: MarketplaceFilter,
  activeTab: MarketplaceTabValue,
) => {
  if (option === 'all') {
    return MARKETPLACE_FILTER_LABELS.all[activeTab];
  }

  return option;
};

export const MarketplaceFilters = ({
  activeTab,
  value,
  onChange,
}: MarketplaceFiltersProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="relative">
      <div className="flex flex-nowrap items-center gap-1 overflow-x-auto pr-8 md:flex-wrap md:overflow-visible md:pr-0">
        {MARKETPLACE_FILTER_OPTIONS.map((option) => {
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
                if (!isActive) onChange(option);
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
