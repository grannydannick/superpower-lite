import { createFileRoute } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import * as z from 'zod';

import { ContentLayout } from '@/components/layouts';
import { Header } from '@/components/shared/header';
import { MarketplaceCta } from '@/features/marketplace/components/marketplace-cta';
import { MarketplaceTabs } from '@/features/marketplace/components/marketplace-tabs';

const marketplaceSearchSchema = z.object({
  tab: z
    .enum(['tests', 'supplements', 'prescriptions', 'orders'])
    .optional()
    .catch(undefined),
});

export const Route = createFileRoute('/_app/marketplace')({
  validateSearch: zodValidator(marketplaceSearchSchema),
  component: MarketplaceComponent,
});

function MarketplaceComponent() {
  return (
    <ContentLayout title="Marketplace" className="max-w-[1600px] md:space-y-6">
      <Header
        title="Marketplace"
        callToAction={<MarketplaceCta />}
        className="hidden md:flex"
      />
      <section id="marketplace" className="space-y-6">
        <MarketplaceTabs />
      </section>
    </ContentLayout>
  );
}
