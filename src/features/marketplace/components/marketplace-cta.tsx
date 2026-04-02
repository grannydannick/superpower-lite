import { Link, useSearch } from '@tanstack/react-router';

import { Orders } from '@/components/icons/marketplace/orders';
import { Prescriptions } from '@/components/icons/marketplace/prescriptions';
import { Subscriptions } from '@/components/icons/marketplace/subscriptions';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Body1 } from '@/components/ui/typography/body1/body1';
import { SUPPLEMENTS_MARKETPLACE_URL } from '@/const/marketplaces';
import { useCredits } from '@/features/orders/api/credits';
import { useGetMultipassUrl } from '@/features/supplements/api';
import { useUser } from '@/lib/auth';
import { cn } from '@/lib/utils';

export const MarketplaceCta = () => {
  const tab = useSearch({
    from: '/_app/marketplace',
    select: (s) => s.tab,
  });
  const isOrdersTab = tab === 'orders';

  const userQuery = useUser();
  const hasRxAccess =
    userQuery.isFetched && userQuery.data?.access?.rx !== false;

  const creditsQuery = useCredits();

  const { data: multipassData, isLoading } = useGetMultipassUrl({
    returnTo: '/apps/retextion/login',
  });

  const credits = creditsQuery.data?.credits ?? [];

  if (creditsQuery.isLoading)
    return (
      <div className="flex items-center gap-4">
        <Skeleton className="inline-flex h-5 w-48 rounded-full" />
        <Skeleton className="inline-flex h-5 w-48 rounded-full" />
        <Skeleton className="inline-flex h-5 w-28 rounded-full" />
      </div>
    );

  const label =
    credits.length > 0 ? `View Orders (${credits.length})` : 'View Orders';

  const handleManageSubscriptionsClick = () => {
    const fallbackUrl = !isLoading ? SUPPLEMENTS_MARKETPLACE_URL : undefined;
    const targetUrl = multipassData?.url ?? fallbackUrl;

    if (!targetUrl) return;

    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex items-center gap-4">
      <Button
        variant="ghost"
        className="group inline-flex items-center gap-2 p-0 text-primary"
        onClick={handleManageSubscriptionsClick}
        type="button"
      >
        <Subscriptions
          aria-hidden
          className="size-4 text-primary transition-colors duration-150 ease-in-out group-hover:text-secondary"
        />
        <Body1
          as="span"
          className="text-primary transition-colors duration-150 ease-in-out group-hover:text-secondary"
        >
          Manage Supplements
        </Body1>
      </Button>
      {hasRxAccess && (
        <Button asChild variant="ghost" className="p-0">
          <Link
            to="/rx-subscriptions"
            className="group relative inline-flex items-center gap-2 text-primary"
          >
            <Prescriptions aria-hidden className="size-4" />
            <Body1 as="span">Manage Prescriptions</Body1>
          </Link>
        </Button>
      )}
      <Button asChild variant="ghost" className="p-0">
        <Link
          to="/orders"
          className="group relative inline-flex items-center gap-2 text-primary"
        >
          <span className="relative inline-flex">
            <Orders
              aria-hidden
              className="size-4 text-primary transition-colors duration-150 ease-in-out group-hover:text-secondary"
            />
            {credits.length > 0 && (
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
        </Link>
      </Button>
    </div>
  );
};
