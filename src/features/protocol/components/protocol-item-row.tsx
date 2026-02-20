import { Button } from '@/components/ui/button';
import { Link } from '@/components/ui/link';
import { Body1, Body2 } from '@/components/ui/typography';
import { env } from '@/config/env';
import { cn } from '@/lib/utils';
import { formatMoney } from '@/utils/format-money';

import type { Activity } from '../api';
import { getItemDetails } from '../utils/get-item-details';

import { ProtocolMarkdown } from './protocol-markdown';

type ProtocolItemRowProps = {
  activity: Activity;
  className?: string;
  showPurchase?: boolean;
};

export function ProtocolItemRow({
  activity,
  className,
  showPurchase,
}: ProtocolItemRowProps) {
  const item = getItemDetails(activity);

  const url = item?.url?.startsWith('/marketplace')
    ? `${env.MARKETING_SITE_URL}${item?.url}`
    : item?.url;

  return (
    <div
      className={cn(
        'flex w-full items-center gap-8 border-b border-zinc-200 p-4 last:border-b-0',
        className,
      )}
    >
      {item?.image && (
        <div className="shrink-0">
          <img
            src={item.image}
            alt={item.title}
            className="h-16 w-12 rounded-lg object-cover"
          />
        </div>
      )}
      <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          {url ? (
            <Link to={url} className="shrink-0" target="_blank">
              <Body1 className="mb-1 truncate hover:underline">
                {item?.title}
              </Body1>
            </Link>
          ) : (
            <Body1 className="mb-1 truncate">{item?.title}</Body1>
          )}
          {showPurchase && (
            <Body1 className="text-primary">
              {formatMoney(Number(item?.price) || 0)}
            </Body1>
          )}
          {activity?.overview ? (
            <Body2 className="text-secondary">{activity?.overview}</Body2>
          ) : (
            <ProtocolMarkdown
              className="line-clamp-2 text-secondary"
              content={activity.description}
            />
          )}
        </div>
        {showPurchase && url && (
          <Link to={url} className="shrink-0" target="_blank">
            <Button variant="default" size="small" className="shrink-0">
              Buy
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
