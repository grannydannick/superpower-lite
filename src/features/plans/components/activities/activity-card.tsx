import { Image } from 'lucide-react';
import { ReactNode } from 'react';

import { Body1 } from '@/components/ui/typography';
import { cn } from '@/lib/utils';

interface ActivityCardProps {
  className?: string;
  image?: string;
  name: string;
  description?: string | ReactNode;
  actionBtn?: ReactNode;
}

export function ActivityCard({
  className,
  image,
  name,
  description,
  actionBtn,
}: ActivityCardProps) {
  return (
    <div
      className={cn(
        'flex bg-white min-h-[96px] transition-all grow items-center justify-between rounded-2xl border border-zinc-200 shadow shadow-black/[0.025] p-2 pr-3',
        className,
      )}
    >
      <div className="flex w-full items-center space-x-6">
        {image ? (
          <img
            src={image}
            alt={name}
            className="size-[72px] rounded-[8px] bg-white object-cover object-center p-4"
          />
        ) : (
          <div className="flex size-[72px] items-center justify-center rounded-[8px] bg-white p-4">
            <Image size={48} className="text-zinc-500" />
          </div>
        )}

        <div className="flex min-w-0 flex-1 items-center justify-between">
          <div className="flex min-w-0 max-w-full flex-col gap-1 overflow-hidden pr-2">
            <Body1 className="break-words">{name}</Body1>
            <div className="break-words">{description}</div>
          </div>
          {actionBtn && <div className="mr-3 shrink-0">{actionBtn}</div>}
        </div>
      </div>
    </div>
  );
}
