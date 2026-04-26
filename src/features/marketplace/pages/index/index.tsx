import { Link } from '@tanstack/react-router';
import { ArrowUpRight, ListFilterIcon } from 'lucide-react';

import { Supplements } from '@/components/icons/marketplace';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/slider-tabs';
import { Body1, Body2, Body3, H4 } from '@/components/ui/typography';
import { env } from '@/config/env';
import { MarketplaceSearch } from '@/features/marketplace/components/marketplace-search';
import { MarketplaceSkeleton } from '@/features/marketplace/components/marketplace-skeleton';
import {
  CATEGORY_ICONS,
  CATEGORY_LABELS,
  PRODUCT_CATEGORIES,
} from '@/features/marketplace/const/product-categories';
import {
  useProductsTableCategory,
  useProductsTableFilter,
  useProductsTableRows,
  useProductsTableSearch,
} from '@/features/marketplace/contexts/products-table-context';
import type { ProductTableRow } from '@/features/marketplace/types/product-table-row';
import { getProductPageLink } from '@/features/marketplace/utils/get-product-page-link';
import { COMPOUNDED_PRODUCTS_DISCLAIMER } from '@/features/prescriptions/const';
import { useAnalytics } from '@/hooks/use-analytics';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePosthogFeatureFlagEnabled } from '@/hooks/use-posthog-feature-flag-enabled';
import { cn } from '@/lib/utils';
import { formatMoney } from '@/utils/format-money';

export function MarketplaceIndexPage() {
  const { category, setCategory } = useProductsTableCategory();
  const { search, setSearch } = useProductsTableSearch();
  const { rows, isLoading } = useProductsTableRows();

  const isSearching = search.trim().length > 0;

  const handleClearSearch = () => {
    setSearch('');
  };

  return (
    <Tabs
      value={category}
      onValueChange={(v) => setCategory(v as typeof category)}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-6">
          <TabsList className="w-fit items-center justify-start gap-2 self-start overflow-x-auto md:w-fit">
            {PRODUCT_CATEGORIES.map((cat) => {
              const Icon = CATEGORY_ICONS[cat];
              return (
                <TabsTrigger
                  key={cat}
                  value={cat}
                  aria-label={CATEGORY_LABELS[cat]}
                >
                  <Icon className="size-5" />
                  <span className="hidden sm:inline">
                    {CATEGORY_LABELS[cat]}
                  </span>
                </TabsTrigger>
              );
            })}
            <a
              href={`${env.API_URL}/marketplace/shopify-redirect`}
              className="relative z-10 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full px-4 py-1.5 text-base font-medium text-secondary transition-all duration-200 hover:text-primary"
            >
              <Supplements className="size-5" />
              <span className="hidden sm:inline">Supplements</span>
              <ArrowUpRight className="size-4 shrink-0" />
            </a>
          </TabsList>

          <MarketplaceSearch
            value={search}
            onChange={(v) => {
              setSearch(v);
            }}
            className="w-full md:w-72"
          />
        </div>

        <ProductsFilters />
      </div>

      {PRODUCT_CATEGORIES.map((cat) => (
        <TabsContent key={cat} value={cat} className="py-6 md:py-10">
          {isLoading ? (
            <MarketplaceSkeleton />
          ) : rows.length === 0 ? (
            <ProductsEmptyState
              isSearching={isSearching}
              search={search}
              onClearSearch={handleClearSearch}
            />
          ) : (
            <div className="flex flex-col gap-8">
              {cat === 'prescriptions' && (
                <div className="flex flex-col gap-4">
                  <RxConsultBanner />
                  <Body3 className="text-tertiary">
                    {COMPOUNDED_PRODUCTS_DISCLAIMER}
                  </Body3>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2 sm:gap-x-8 sm:gap-y-6 lg:grid-cols-4">
                {rows.map((row) => (
                  <ProductCard key={row.id} product={row.original} />
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}

function RxConsultBanner() {
  const enabled = usePosthogFeatureFlagEnabled(
    'protocol-inapp-rx-clinician-call',
  );
  const { track } = useAnalytics();

  if (!enabled) return null;

  return (
    <div className="flex flex-col items-start gap-4 rounded-2xl bg-zinc-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="flex items-center gap-4">
        <img
          src="/services/doctors/doctors.webp"
          alt="Superpower care team"
          className="h-8 w-auto shrink-0"
        />
        <div className="flex flex-col">
          <Body1>Have questions about a prescription?</Body1>
          <Body2 className="text-secondary">
            Talk to your care team about treatment options.
          </Body2>
        </div>
      </div>
      <Link
        to="/consults/new"
        onClick={() =>
          track('protocol_rx_clinician_call_cta_clicked', {
            source: 'rx_marketplace',
          })
        }
        className="flex w-full shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-sm shadow-[0px_2px_2px_0px_rgba(0,0,0,0.02)] transition-colors hover:bg-zinc-50 sm:w-auto"
      >
        Schedule a 1:1 consult
      </Link>
    </div>
  );
}

function ProductsFilters() {
  const { availableFilters, filter, setFilter } = useProductsTableFilter();
  const isMobile = useIsMobile();

  if (availableFilters.length === 0) return null;

  const PILL_LIMIT = 3;
  const pillOptions = availableFilters.slice(0, PILL_LIMIT);
  const dropdownOptions = availableFilters.slice(PILL_LIMIT);
  const isDropdownActive =
    filter !== null && dropdownOptions.some((o) => o.slug === filter);

  return (
    <div className="relative">
      <div className="flex flex-nowrap items-center gap-1 overflow-x-auto pr-8 md:flex-wrap md:overflow-visible md:pr-10">
        {dropdownOptions.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                size={isMobile ? 'small' : 'medium'}
                variant={isDropdownActive ? 'default' : 'outline'}
                className={cn(
                  'space-x-2.5 rounded-full border shadow-none transition-colors',
                  isDropdownActive
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
              {dropdownOptions.map((option) => (
                <DropdownMenuCheckboxItem
                  key={option.slug}
                  checked={filter === option.slug}
                  onCheckedChange={(checked) =>
                    setFilter(checked ? option.slug : null)
                  }
                  className="rounded-lg"
                >
                  {option.title}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {dropdownOptions.length > 0 && pillOptions.length > 0 && (
          <div className="relative mx-2 mt-0.5 h-5 w-px shrink-0 bg-zinc-200" />
        )}

        {/* "All" pill to reset filter */}
        <Button
          type="button"
          size={isMobile ? 'small' : 'medium'}
          variant={filter === null ? 'default' : 'outline'}
          className={cn(
            'shrink-0 whitespace-nowrap rounded-full border shadow-none transition-colors',
            filter === null ? 'border-primary' : 'border-input text-secondary',
          )}
          aria-pressed={filter === null}
          onClick={() => setFilter(null)}
        >
          All
        </Button>

        {pillOptions.map((option) => {
          const isActive = filter === option.slug;
          return (
            <Button
              key={option.slug}
              type="button"
              size={isMobile ? 'small' : 'medium'}
              variant={isActive ? 'default' : 'outline'}
              className={cn(
                'shrink-0 whitespace-nowrap rounded-full border shadow-none transition-colors',
                isActive ? 'border-primary' : 'border-input text-secondary',
              )}
              aria-pressed={isActive}
              onClick={() => setFilter(isActive ? null : option.slug)}
            >
              {option.title}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

function ProductsEmptyState({
  isSearching,
  search,
  onClearSearch,
}: {
  isSearching: boolean;
  search: string;
  onClearSearch: () => void;
}) {
  return (
    <div className="flex flex-col items-center space-y-4 rounded-2xl border border-dashed border-zinc-200 px-6 py-10 text-center text-sm text-secondary">
      <p>
        {isSearching
          ? `No results found for "${search.trim()}".`
          : 'No products available right now.'}
      </p>
      {isSearching && (
        <Button variant="outline" size="medium" onClick={onClearSearch}>
          Clear search
        </Button>
      )}
    </div>
  );
}

function ProductCard({ product }: { product: ProductTableRow }) {
  const minPrice = product.prices?.length
    ? Math.min(...product.prices.map((p) => p.amount))
    : null;
  const href = getProductPageLink(product);

  return (
    <>
      <Link
        to={href}
        className="group relative hidden cursor-pointer flex-col gap-4 overflow-hidden sm:flex"
      >
        <div className="relative flex aspect-square items-center rounded-[20px] bg-zinc-50">
          {product.image && (
            <img
              src={product.image}
              alt={product.title}
              className="h-full w-full rounded-[20px] object-contain"
            />
          )}
          <Button
            className="transition-timing-function-[cubic-bezier(0.22,_0.61,_0.35,_1)] pointer-events-none absolute inset-x-4 bottom-4 translate-y-2 opacity-0 blur-sm transition-all duration-200 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-hover:blur-0"
            size="medium"
          >
            View Product
          </Button>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-2">
            <H4 className="truncate">{product.title}</H4>
            {minPrice != null && <H4>{formatMoney(minPrice)}</H4>}
          </div>
          {product.subtitle && (
            <Body1 className="text-secondary">{product.subtitle}</Body1>
          )}
        </div>
      </Link>

      <Link to={href} className="flex flex-col gap-2 sm:hidden">
        <div className="aspect-square w-full rounded-[20px] bg-zinc-50">
          {product.image && (
            <img
              src={product.image}
              alt={product.title}
              className="h-full w-full rounded-[20px] object-contain"
            />
          )}
        </div>
        <div className="flex flex-col gap-1">
          <Body2 className="line-clamp-1">{product.title}</Body2>
          {product.subtitle && (
            <Body3 className="text-secondary">{product.subtitle}</Body3>
          )}
          {minPrice != null && <Body2>{formatMoney(minPrice)}</Body2>}
        </div>
      </Link>
    </>
  );
}
