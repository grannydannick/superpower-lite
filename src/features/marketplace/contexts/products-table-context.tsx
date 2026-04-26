import { useNavigate } from '@tanstack/react-router';
import {
  type ColumnDef,
  type ColumnFiltersState,
  type FilterFn,
  type Table,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useCallback, useMemo, useState } from 'react';
import { createContext, useContextSelector } from 'use-context-selector';

import { useMarketplaceProducts } from '../api/marketplace-products';
import { useMarketplaceSummary } from '../api/marketplace-summary';
import { type ProductCategory } from '../const/product-categories';
import type { ProductTableRow } from '../types/product-table-row';
import type { ProductsFilter } from '../types/products-filter';
import {
  buildProductSearchText,
  fuzzyProductFilterFn,
} from '../utils/search-products';

export type FilterOption = { slug: string; title: string };

type ProductsTableContextValue = {
  table: Table<ProductTableRow>;
  isLoading: boolean;
  category: ProductCategory;
  filter: string | null;
  search: string;
  setCategory: (category: ProductCategory) => void;
  setFilter: (filter: string | null) => void;
  setSearch: (search: string) => void;
  availableFilters: FilterOption[];
};

const ProductsTableContext = createContext<ProductsTableContextValue | null>(
  null,
);

const CATEGORY_TO_TYPE: Partial<Record<string, ProductTableRow['type']>> = {
  tests: 'diagnostic_test',
  prescriptions: 'prescription',
};

const categoryFilterFn: FilterFn<ProductTableRow> = (
  row,
  _columnId,
  value: string,
) => {
  const type = CATEGORY_TO_TYPE[value];
  return type == null || row.original.type === type;
};
categoryFilterFn.autoRemove = (val: string) => !val || val === 'all';

const subFilterFn: FilterFn<ProductTableRow> = (
  row,
  _columnId,
  value: string,
) => {
  return row.original.tags.some((t) => t.slug === value);
};
subFilterFn.autoRemove = (val: string | null) => !val;

const columns: ColumnDef<ProductTableRow>[] = [
  {
    id: 'category',
    accessorFn: (row) => row.type,
    filterFn: categoryFilterFn,
  },
  {
    id: 'subFilter',
    accessorFn: (row) => row.tags,
    filterFn: subFilterFn,
  },
  {
    id: 'search',
    accessorFn: (row) => buildProductSearchText(row),
    filterFn: fuzzyProductFilterFn,
  },
];

type ProductsTableProviderProps = {
  initialFilter: ProductsFilter;
  children: React.ReactNode;
};

export function ProductsTableProvider({
  initialFilter,
  children,
}: ProductsTableProviderProps) {
  const navigate = useNavigate({ from: '/marketplace' });
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(() => {
    const filters: ColumnFiltersState = [];
    if (initialFilter.category !== 'all')
      filters.push({ id: 'category', value: initialFilter.category });
    if (initialFilter.filter)
      filters.push({ id: 'subFilter', value: initialFilter.filter });
    return filters;
  });
  const [search, setLocalSearch] = useState<string>(initialFilter.search);

  const category =
    (columnFilters.find((f) => f.id === 'category')
      ?.value as ProductCategory) ?? 'all';
  const filter =
    (columnFilters.find((f) => f.id === 'subFilter')?.value as string) ?? null;

  const { data: summary } = useMarketplaceSummary();

  // TODO: once pagination is needed, add a limit param here
  // e.g. useMarketplaceProducts({ params: { limit: '100' } })
  const { data, isLoading } = useMarketplaceProducts();

  const tableData = useMemo<ProductTableRow[]>(() => data?.items ?? [], [data]);

  const table = useReactTable({
    data: tableData,
    columns,
    state: { columnFilters, globalFilter: search },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: fuzzyProductFilterFn,
    manualFiltering: false,
  });

  const updateUrl = useCallback(
    (updates: Partial<ProductsFilter>) => {
      void navigate({
        replace: true,
        search: (prev) => {
          const merged = { ...prev, ...updates };
          return {
            ...merged,
            category: merged.category === 'all' ? undefined : merged.category,
            filter: (merged.filter as string | null | undefined) ?? undefined,
            search: (merged.search as string | undefined) || undefined,
          };
        },
      });
    },
    [navigate],
  );

  const setCategory = useCallback(
    (next: ProductCategory) => {
      setColumnFilters(next === 'all' ? [] : [{ id: 'category', value: next }]);
      updateUrl({ category: next, filter: null });
    },
    [updateUrl],
  );

  const setFilter = useCallback(
    (next: string | null) => {
      setColumnFilters((old) => {
        const without = old.filter((f) => f.id !== 'subFilter');
        return next ? [...without, { id: 'subFilter', value: next }] : without;
      });
      updateUrl({ filter: next });
    },
    [updateUrl],
  );

  const setSearch = useCallback(
    (next: string) => {
      setLocalSearch(next);
      updateUrl({ search: next });
    },
    [updateUrl],
  );

  const availableFilters = useMemo<FilterOption[]>(() => {
    const allTags = summary?.tags ?? [];

    const categoryProducts =
      category === 'all'
        ? tableData
        : tableData.filter(
            (p) =>
              CATEGORY_TO_TYPE[category] == null ||
              p.type === CATEGORY_TO_TYPE[category],
          );

    const presentSlugs = new Set(
      categoryProducts.flatMap((p) => p.tags.map((t) => t.slug)),
    );

    return allTags.filter((t) => presentSlugs.has(t.slug));
  }, [summary, tableData, category]);

  return (
    <ProductsTableContext.Provider
      value={{
        table,
        isLoading,
        category,
        filter,
        search,
        setCategory,
        setFilter,
        setSearch,
        availableFilters,
      }}
    >
      {children}
    </ProductsTableContext.Provider>
  );
}

function useProductsTableSelector<T>(
  selector: (ctx: ProductsTableContextValue) => T,
): T {
  return useContextSelector(ProductsTableContext, (ctx) => {
    if (!ctx)
      throw new Error(
        'useProductsTable must be used within ProductsTableProvider',
      );
    return selector(ctx);
  });
}

export const useProductsTable = () => useProductsTableSelector((s) => s);
export const useProductsTableFilter = () =>
  useProductsTableSelector((s) => ({
    filter: s.filter,
    setFilter: s.setFilter,
    availableFilters: s.availableFilters,
  }));
export const useProductsTableCategory = () =>
  useProductsTableSelector((s) => ({
    category: s.category,
    setCategory: s.setCategory,
  }));
export const useProductsTableSearch = () =>
  useProductsTableSelector((s) => ({
    search: s.search,
    setSearch: s.setSearch,
  }));
export const useProductsTableRows = () =>
  useProductsTableSelector((s) => ({
    rows: s.table.getFilteredRowModel().rows,
    isLoading: s.isLoading,
  }));
