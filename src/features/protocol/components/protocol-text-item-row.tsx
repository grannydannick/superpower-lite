import { DummyProductIcon } from '@/components/icons/dummy-product-icon';
import { Body1, Body2 } from '@/components/ui/typography';
import { cn } from '@/lib/utils';

import type { Activity } from '../api';
import { getItemDetails } from '../utils/get-item-details';

import { ProtocolMarkdown } from './protocol-markdown';

type ProtocolTextItemRowProps = {
  activity: Activity;
  className?: string;
  useDummyIcon?: boolean;
};

export function ProtocolTextItemRow({
  activity,
  className,
  useDummyIcon = false,
}: ProtocolTextItemRowProps) {
  const item = getItemDetails(activity);

  return (
    <div
      className={cn(
        'flex w-full items-center gap-8 p-4 border-b border-zinc-200 last:border-b-0',
        className,
      )}
    >
      {item?.image && !useDummyIcon && (
        <div className="shrink-0">
          <img
            src={item.image}
            alt={item.title}
            className="h-16 w-12 rounded-lg object-cover"
          />
        </div>
      )}
      {useDummyIcon && (
        <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-zinc-100">
          <DummyProductIcon className="size-6" />
        </div>
      )}
      <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <Body1 className="mb-1 truncate">{item?.title}</Body1>
          {/* Hack: Make it look nicer if it isn't MD */}
          {!activity.description.includes('**') ? (
            <Body2 className="text-secondary">{activity.description}</Body2>
          ) : (
            <ProtocolMarkdown
              className="text-secondary"
              content={activity.description}
            />
          )}
        </div>
      </div>
    </div>
  );
}
