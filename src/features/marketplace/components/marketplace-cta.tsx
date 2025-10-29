import { NavLink, useSearchParams } from 'react-router-dom';

import { Orders } from '@/components/icons/marketplace/orders';
import { Subscriptions } from '@/components/icons/marketplace/subscriptions';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Body1 } from '@/components/ui/typography/body1/body1';
import { useGroupedOrders } from '@/features/orders/hooks/use-grouped-orders';
import { cn } from '@/lib/utils';

const SUBSCRIPTIONS_URL =
  'https://products.superpower.com/apps/retextion#/login';

export const MarketplaceCta = () => {
  const [searchParams] = useSearchParams();
  const isOrdersTab = searchParams.get('tab') === 'orders';
  const { buckets, groupedOrdersLoading } = useGroupedOrders();

  if (groupedOrdersLoading)
    return (
      <div className="flex items-center gap-4">
        <Skeleton className="inline-flex h-8 w-40 rounded-full" />
        <Skeleton className="inline-flex h-8 w-24 rounded-full" />
      </div>
    );

  const label =
    buckets.drafts.length > 0
      ? `View Orders (${buckets.drafts.length})`
      : 'View Orders';

  return (
    <div className="flex items-center gap-4">
      <Button asChild variant="ghost" className="p-0">
        <a
          href={SUBSCRIPTIONS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-primary [&>*]:text-primary [&>*]:transition-colors [&>*]:duration-150 [&>*]:ease-in-out [&>*]:hover:text-secondary"
        >
          <Subscriptions aria-hidden className="size-4" />
          <Body1 as="span">Manage Subscriptions</Body1>
        </a>
      </Button>
      <Button asChild variant="ghost" className="p-0">
        <NavLink
          to="?tab=orders"
          className="group relative inline-flex items-center gap-2 text-primary"
        >
          <span className="relative inline-flex">
            <Orders
              aria-hidden
              className="size-4 text-primary transition-colors duration-150 ease-in-out group-hover:text-secondary"
            />
            {buckets.drafts.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 size-1 rounded-full bg-[#11C182]" />
            )}
          </span>
          <Body1
            as="span"
            className="text-primary transition-colors duration-150 ease-in-out group-hover:text-secondary"
          >
            {label}
          </Body1>
          <div
            className={cn(
              'absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-vermillion-900 transition-all duration-150 ease-in-out',
              isOrdersTab ? 'opacity-100' : 'opacity-0',
            )}
          />
        </NavLink>
      </Button>
    </div>
  );
};
