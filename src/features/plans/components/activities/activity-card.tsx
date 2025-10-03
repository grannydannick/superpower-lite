import { Image } from 'lucide-react';
import { ReactNode } from 'react';

import { Body1 } from '@/components/ui/typography';
import { cn } from '@/lib/utils';

interface ActivityCardProps {
  className?: string;
  image?: string;
  name: string | ReactNode;
  alt?: string;
  description?: string | ReactNode;
  actionBtn?: ReactNode;
}

export function ActivityCard({
  className,
  image,
  name,
  alt,
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
      <div className="flex w-full items-center space-x-4">
        {image ? (
          <div className="ml-0.5 size-[56px] rounded-md bg-white">
            <img
              src={image}
              alt={alt || (name as string)}
              className="size-full object-cover object-center"
              style={{
                WebkitMask:
                  'radial-gradient(circle at center, black 50%, transparent 75%)',
                mask: 'radial-gradient(circle at center, black 50%, transparent 75%)',
              }}
            />
          </div>
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
