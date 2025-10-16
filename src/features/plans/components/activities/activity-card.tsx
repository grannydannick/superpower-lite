import { HelpCircle, Image } from 'lucide-react';
import { ReactNode } from 'react';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Body1 } from '@/components/ui/typography';
import { cn } from '@/lib/utils';

interface ActivityCardProps {
  className?: string;
  image?: string;
  name: string | ReactNode;
  alt?: string;
  description?: string | ReactNode;
  message?: string | ReactNode;
  link?: string;
  actionBtn?: ReactNode;
}

export function ActivityCard({
  className,
  image,
  name,
  alt,
  description,
  message,
  link,
  actionBtn,
}: ActivityCardProps) {
  return (
    <div
      className={cn(
        'flex bg-white min-h-[96px] transition-all grow items-center justify-between rounded-2xl border border-zinc-200 shadow shadow-black/[0.025] pl-2 py-6 lg:py-4 pr-3',
        className,
      )}
    >
      <div className="flex w-full flex-col gap-2 space-x-4 lg:flex-row lg:items-center lg:gap-0">
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

        <div className="flex min-w-0 flex-1 flex-col justify-between gap-4 lg:flex-row lg:items-center lg:gap-0">
          <div className="flex min-w-0 max-w-full flex-col gap-1 overflow-hidden pr-2">
            <Body1 className="break-words">
              {link ? (
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group decoration-transparent decoration-dotted underline-offset-4 transition-[text-decoration-color] duration-300 hover:underline hover:decoration-zinc-400"
                >
                  {name}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="ml-1.5 inline-block translate-y-0.5">
                        <HelpCircle
                          size={16}
                          className="shrink-0 text-secondary"
                        />
                      </TooltipTrigger>
                      <TooltipContent>Click to learn more</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </a>
              ) : (
                name
              )}
            </Body1>

            <div className="break-words">{description}</div>
          </div>
          <div className="flex flex-1 items-center gap-1 lg:justify-end">
            {message && (
              <div className="mr-3 hidden shrink-0 lg:block">{message}</div>
            )}
            {actionBtn && (
              <div className="mr-3 flex-1 shrink-0 lg:flex-none">
                {actionBtn}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
