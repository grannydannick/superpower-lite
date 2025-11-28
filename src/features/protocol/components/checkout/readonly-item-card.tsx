import { Body1, Body2 } from '@/components/ui/typography';

import { Activity } from '../../api';
import { getItemDetails } from '../../utils/get-item-details';

type ReadonlyItemCardProps = {
  activity: Activity;
};

export const ReadonlyItemCard = ({ activity }: ReadonlyItemCardProps) => {
  const item = getItemDetails(activity);

  if (activity.type === 'general') return null;

  return (
    <div className="flex w-full items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      {item.image && (
        <img
          src={item.image}
          alt={item.title}
          className="size-12 rounded-md object-cover"
        />
      )}
      <div className="flex-1 space-y-2">
        <Body1 className="font-medium">{item.title}</Body1>
        {activity.overview ? (
          <Body2 className="leading-relaxed text-secondary">
            {activity.overview}
          </Body2>
        ) : null}
        {activity.actionBrief && activity.type === 'product' ? (
          <Body2 className="leading-relaxed text-secondary">
            {activity.actionBrief}
          </Body2>
        ) : null}
        {/* <ProtocolMarkdown
          className="text-secondary"
          content={
            isService && service?.description
              ? service?.description
              : activity.description
          }
          citations={isService ? undefined : activity.citations}
        /> */}
      </div>
    </div>
  );
};
