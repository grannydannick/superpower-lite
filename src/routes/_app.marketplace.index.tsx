import { createFileRoute } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import * as z from 'zod';

import { ContentLayout } from '@/components/layouts';
import { Header } from '@/components/shared/header';
import { MarketplaceCta } from '@/features/marketplace/components/marketplace-cta';
import { ProductsTableProvider } from '@/features/marketplace/contexts/products-table-context';
import { MarketplaceIndexPage } from '@/features/marketplace/pages/index/index';
import {
  ProductsFilterRouteSchema,
  resolveProductsFilter,
} from '@/features/marketplace/types/products-filter';

// tab is kept for backward compatibility with existing links throughout the app
const marketplaceSearchSchema = ProductsFilterRouteSchema.extend({
  tab: z
    .enum(['tests', 'supplements', 'prescriptions', 'orders'])
    .optional()
    .catch(undefined),
});

export const Route = createFileRoute('/_app/marketplace/')({
  validateSearch: zodValidator(marketplaceSearchSchema),
  component: MarketplaceComponent,
});

function MarketplaceComponent() {
  const search = resolveProductsFilter(Route.useSearch());

  return (
    <ContentLayout title="Clinic" className="max-w-[1600px] md:space-y-6">
      <Header
        title="Clinic"
        callToAction={<MarketplaceCta />}
        className="hidden md:flex"
      />
      <section id="marketplace" className="space-y-6">
        <ProductsTableProvider initialFilter={search}>
          <MarketplaceIndexPage />
        </ProductsTableProvider>
      </section>
    </ContentLayout>
  );
}
