import { Skeleton } from '@/components/ui/skeleton';
import { useMarketplaceProductContent } from '@/features/marketplace/api/marketplace-products';
import { cn } from '@/lib/utils';

import { MarketplaceProductMarkdownBody } from './product-markdown-body';

export function ProductContent({
  slug,
  className,
}: {
  slug: string;
  className?: string;
}) {
  const { data, isLoading } = useMarketplaceProductContent(slug);

  if (isLoading) {
    return (
      <>
        <div className="my-6 h-px w-full bg-zinc-200" />
        <div className={cn('flex flex-col gap-2', className)}>
          <Skeleton className="h-4 w-full rounded-full" />
          <Skeleton className="h-4 w-11/12 rounded-full" />
          <Skeleton className="h-4 w-3/4 rounded-full" />
        </div>
      </>
    );
  }

  const raw = data?.content ?? data?.description;
  if (raw == null || raw.trim().length === 0) return null;

  return (
    <MarketplaceProductMarkdownBody markdown={raw} className={className} />
  );
}
