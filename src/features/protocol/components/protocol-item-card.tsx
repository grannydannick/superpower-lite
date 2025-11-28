import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

import { AnimatedCheckbox } from '@/components/ui/checkbox';
import { ProgressiveImage } from '@/components/ui/progressive-image';
import { Body2, Body1 } from '@/components/ui/typography';
import { cn } from '@/lib/utils';

import type { Activity } from '../api';
import { getItemDetails } from '../utils/get-item-details';

type ProtocolItemCardProps = {
  activity: Activity;
  className?: string;
  children?: ReactNode;
  selected?: boolean;
  onSelectChange?: (selected: boolean) => void;
};

export function ProtocolItemCard({
  activity,
  className,
  children,
  selected,
  onSelectChange,
}: ProtocolItemCardProps) {
  const navigate = useNavigate();
  const itemDetails = getItemDetails(activity);

  const getTitle = () => {
    if (
      activity.type === 'general' ||
      activity.type === 'lifestyle' ||
      activity.type === 'nutrition'
    ) {
      const typeLabel = {
        lifestyle: 'Lifestyle',
        nutrition: 'Nutrition',
        general: 'General',
      }[activity.type];
      return `${typeLabel} Recommendation`;
    }

    return itemDetails.title;
  };

  const getImage = () => {
    if (!itemDetails.image) {
      return undefined;
    }

    return {
      src: itemDetails.image,
      alt: getTitle(),
    };
  };
  const handleClick = (event: React.MouseEvent) => {
    if (onSelectChange) {
      event.preventDefault();
      onSelectChange(!selected);
      return;
    }

    if (itemDetails.url) {
      if (itemDetails.linkType === 'external') {
        window.open(itemDetails.url, '_blank', 'noopener,noreferrer');
      } else if (itemDetails.linkType === 'internal') {
        navigate(itemDetails.url);
      }
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (onSelectChange) {
        onSelectChange(!selected);
      } else if (itemDetails.url) {
        if (itemDetails.linkType === 'external') {
          window.open(itemDetails.url, '_blank', 'noopener,noreferrer');
        } else if (itemDetails.linkType === 'internal') {
          navigate(itemDetails.url);
        }
      }
    }
  };

  const isInteractive = onSelectChange || itemDetails.url;

  return (
    <div
      role="button"
      tabIndex={isInteractive ? 0 : undefined}
      onClick={handleClick}
      onKeyDown={isInteractive ? handleKeyDown : undefined}
      aria-pressed={onSelectChange ? selected : undefined}
      className={cn(
        'rounded-2xl cursor-default transition-all duration-200 flex flex-col justify-start items-start border border-zinc-200 relative bg-white shadow-sm p-4',
        isInteractive && 'cursor-pointer hover:bg-zinc-50 outline-none',
        className,
      )}
    >
      {onSelectChange && (
        <AnimatedCheckbox
          checked={selected ?? false}
          className="absolute left-4 top-4 z-10 size-5 rounded-md border border-transparent data-[state='unchecked']:border-zinc-200 data-[state='unchecked']:bg-zinc-100"
        />
      )}

      <div className="space-y-2">
        {getImage() && (
          <div className="mb-4">
            <ProgressiveImage
              src={getImage()!.src}
              alt={getImage()!.alt ?? ''}
              className="h-40 w-full rounded-xl object-contain"
            />
          </div>
        )}
        <div className="flex-1 space-y-2">
          <Body1>{getTitle()}</Body1>
          <ul className="list-inside list-disc">
            {activity.overview && (
              <li>
                <Body2 className="-ml-2 inline text-secondary">
                  {activity.overview}
                </Body2>
              </li>
            )}
            {activity.actionBrief && (
              <li>
                <Body2 className="-ml-2 inline text-secondary">
                  {activity.actionBrief}
                </Body2>
              </li>
            )}
          </ul>
        </div>
        {children}
      </div>
    </div>
  );
}
