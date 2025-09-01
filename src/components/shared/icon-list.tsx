import { LucideIcon } from 'lucide-react';
import React from 'react';

import { Body1 } from '@/components/ui/typography';

export interface IconListItem {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface IconListProps {
  items: IconListItem[];
  showConnector?: boolean;
  className?: string;
}

export const IconList = ({
  items,
  showConnector = true,
  className,
}: IconListProps) => {
  return (
    <div className={className}>
      {items.map((item, index) => {
        const IconComponent = item.icon;
        const isLastItem = index === items.length - 1;

        return (
          <div key={index} className="relative">
            <div className="flex items-start">
              <div className="relative z-10 mr-4 mt-1 rounded-full border-2 border-vermillion-900/20 bg-white p-2">
                <IconComponent className="size-5 text-vermillion-900" />
              </div>
              <div className="mb-5 py-2">
                <Body1 className="font-medium text-foreground">
                  {item.title}
                </Body1>
                <Body1 className="text-secondary">{item.description}</Body1>
              </div>
            </div>
            {showConnector && !isLastItem && (
              <div
                className="absolute left-[20px] top-[48px] h-full w-px -translate-x-1/2 animate-timeline-flow bg-repeat-y transition-all duration-500"
                style={{
                  height: 'calc(100% - 48px)',
                  backgroundImage:
                    'linear-gradient(#d4d4d8 33%, transparent 0%)',
                  backgroundSize: '1px 5px',
                  backgroundPosition: 'right',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
