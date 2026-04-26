import uFuzzy from '@leeoniya/ufuzzy';
import type { FilterFn } from '@tanstack/react-table';

import type { ProductTableRow } from '../types/product-table-row';

const uf = new uFuzzy({ intraMode: 1 });

export const buildProductSearchText = (row: ProductTableRow) =>
  [row.title, row.name, row.subtitle, ...row.tags.map((t) => t.title)]
    .filter(Boolean)
    .join(' ');

export const fuzzyProductFilterFn: FilterFn<ProductTableRow> = (
  row,
  _columnId,
  value: string,
) => {
  if (!value.trim()) return true;
  const [idxs] = uf.search([buildProductSearchText(row.original)], value);
  return (idxs?.length ?? 0) > 0;
};

fuzzyProductFilterFn.autoRemove = (val: string) => !val?.trim();
