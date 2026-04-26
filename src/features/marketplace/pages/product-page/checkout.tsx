import { Link } from '@tanstack/react-router';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Spinner } from '@/components/ui/spinner';
import { PurchaseDialog } from '@/features/orders/components/purchase';
import type { HealthcareService } from '@/types/api';

import { useMarketplaceProduct } from '../../api/marketplace-products';

type CheckoutPageProps = {
  slug: string;
  onClose: () => void;
};

export function CheckoutPage({ slug, onClose }: CheckoutPageProps) {
  const { data: product, isLoading } = useMarketplaceProduct(slug);

  const service: HealthcareService | null = product?.legacy
    ? {
        id: product.legacy.id,
        name: product.title,
        description: product.description ?? undefined,
        price: product.prices?.[0]?.amount ?? 0,
        active: product.status === 'published',
        bloodTubeCount: product.legacy.bloodTubeCount ?? 0,
        additionalClassification: [],
        supportsLabOrder: false,
      }
    : null;

  if (isLoading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner variant="primary" size="lg" />
      </div>
    );
  }

  if (!product || !service) {
    return (
      <div className="mx-auto w-full max-w-3xl px-6 py-9 md:px-16">
        <p className="text-zinc-500">Product not found.</p>
        <Link
          to="/marketplace"
          className="mt-4 inline-block text-sm text-primary"
        >
          Back to Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl py-9">
      <CheckoutBreadcrumb slug={slug} title={product.title} />
      <PurchaseDialog healthcareService={service} onClose={onClose} />
    </div>
  );
}

function CheckoutBreadcrumb({ slug, title }: { slug: string; title: string }) {
  return (
    <Breadcrumb className="px-6 md:px-16">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/marketplace">Marketplace</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/marketplace/products/$slug" params={{ slug }}>
              {title}
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>Checkout</BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
