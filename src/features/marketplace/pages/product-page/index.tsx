import { Link } from '@tanstack/react-router';
import { ArrowUpRight } from 'lucide-react';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Body1 } from '@/components/ui/typography';
import { H2 } from '@/components/ui/typography/h2/h2';

import { useProduct } from '../../contexts/product-context';
import { getProductPurchaseLink } from '../../utils/get-product-purchase-link';

import { ProductBiomarkers } from './components/product-biomarkers';
import { ProductContent } from './components/product-content';

export function ProductPage() {
  const { product, query } = useProduct();

  if (query.isLoading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner variant="primary" size="lg" />
      </div>
    );
  }

  if (!product) {
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
    <>
      <div className="mx-auto w-full max-w-3xl py-9 pb-28">
        <ProductBreadcrumb title={product.title} />
        <ProductHero />
        <ProductBody />
        <ProductBiomarkers className="px-6 md:px-16" />
      </div>
      <ProductCta />
    </>
  );
}

function ProductBreadcrumb({ title }: { title: string }) {
  return (
    <Breadcrumb className="px-6 md:px-16">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/marketplace">Marketplace</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>{title}</BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

function ProductHero() {
  const { product } = useProduct();
  if (!product) return null;

  const prices = product.prices ?? [];
  const minPrice =
    prices.length > 0 ? Math.min(...prices.map((p) => p.amount)) : null;
  const currency = prices[0]?.currency ?? 'usd';
  const formattedPrice =
    minPrice != null
      ? new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency,
          maximumFractionDigits: 0,
        }).format(minPrice / 100)
      : null;

  return (
    <div className="flex flex-col justify-between gap-12 px-6 pt-8 md:flex-row md:px-16">
      <div className="flex flex-col justify-center gap-4">
        <H2>{product.title}</H2>
        {formattedPrice && (
          <Body1 className="text-zinc-400">{formattedPrice}</Body1>
        )}
        {product.shortDescription && (
          <Body1 className="text-zinc-500">{product.shortDescription}</Body1>
        )}
        {product.sampleReport && (
          <a
            href={product.sampleReport}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-1 text-sm text-primary"
          >
            View sample report
            <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        )}
      </div>
      {product.image && (
        <img
          src={product.image}
          alt={product.title}
          className="hidden h-[362px] w-full rounded-2xl border border-zinc-200 bg-white object-cover md:block md:size-[362px]"
        />
      )}
    </div>
  );
}

function ProductBody() {
  const { slug } = useProduct();
  if (!slug) return null;

  return <ProductContent slug={slug} className="px-6 md:px-16" />;
}

function ProductCta() {
  const { product } = useProduct();
  if (!product) return null;

  const link = getProductPurchaseLink(product);

  return (
    <div className="sticky bottom-[76px] z-10 border-t border-zinc-100 bg-white py-4 md:bottom-0">
      <div className="mx-auto max-w-3xl px-6 md:px-16">
        {link.available ? (
          <Button asChild className="w-full">
            <Link to={link.href}>{link.label}</Link>
          </Button>
        ) : (
          <Button className="w-full" disabled>
            {link.unavailableReason}
          </Button>
        )}
      </div>
    </div>
  );
}
