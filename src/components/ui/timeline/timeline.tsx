import { cva, VariantProps } from 'class-variance-authority';
import { CheckIcon, CircleAlert, PlusIcon } from 'lucide-react';
import * as React from 'react';
import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

import { LockIcon } from '@/components/icons';
import { Body1, Body2 } from '@/components/ui/typography';
import { cn } from '@/lib/utils';

const Timeline = React.forwardRef<
  HTMLOListElement,
  React.HTMLAttributes<HTMLOListElement>
>(({ className, ...props }, ref) => (
  <ol ref={ref} className={cn('flex flex-col', className)} {...props} />
));
Timeline.displayName = 'Timeline';

const TimelineItem = React.forwardRef<
  HTMLLIElement,
  React.LiHTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    className={cn('relative flex flex-col py-0 pt-0 [&>*]:mb-3', className)}
    {...props}
  />
));
TimelineItem.displayName = 'TimelineItem';

const TimelineConnector = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'absolute top-[48px] left-[9px] -translate-x-1/2 translate-y-2 h-full w-px bg-[linear-gradient(#d4d4d8_33%,_transparent_0%)] bg-right bg-repeat-y bg-[length:1px_5px]',
      className,
    )}
    {...props}
  />
));
TimelineConnector.displayName = 'TimelineConnector';

const TimelineSpacer = ({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) => {
  return (
    <TimelineItem className={cn('py-6', className)}>
      {children}
      <TimelineConnector />
    </TimelineItem>
  );
};

const TimelineHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center gap-4', className)}
    {...props}
  />
));
TimelineHeader.displayName = 'TimelineHeader';

const timelineDotVariants = cva(
  'flex size-5 flex-col items-center justify-center rounded-full border border-zinc-300',
  {
    variants: {
      status: {
        default: '[&>*]:hidden',
        current:
          'border-dashed  border-vermillion-900 [&>*:not(.radix-circle)]:hidden [&>.radix-circle]:bg-vermillion-900 [&>.radix-circle]:fill-current',
        done: 'size-6 border-none bg-transparent [&>*:not(.radix-check)]:hidden [&>.radix-check]:text-green-500',
        disabled:
          'border-none bg-transparent [&>*:not(.radix-lock)]:hidden [&>.radix-lock]:text-background',
        action_required:
          'size-5 border-none bg-transparent [&>*:not(.radix-alert)]:hidden [&>.radix-alert]:text-vermillion-900',
        custom: '[&>*:not(:nth-child(4))]:hidden [&>*:nth-child(4)]:block',
      },
    },
    defaultVariants: {
      status: 'default',
    },
  },
);

type TimelineDotVariant =
  | 'custom'
  | 'default'
  | 'disabled'
  | 'current'
  | 'done'
  | 'action_required';

interface TimelineDotProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof timelineDotVariants> {
  customIcon?: React.ReactNode;
}

const TimelineDot = React.forwardRef<HTMLDivElement, TimelineDotProps>(
  ({ className, status, customIcon, ...props }, ref) => (
    <div className={cn('z-[1] py-2 backdrop-blur')}>
      <div
        role="status"
        className={cn(
          'timeline-dot',
          timelineDotVariants({ status }),
          className,
        )}
        ref={ref}
        {...props}
      >
        <div className="radix-circle size-2.5 rounded-full" />
        <CheckIcon className="radix-check size-5" />
        <LockIcon className="radix-lock size-6" />
        <CircleAlert className="radix-alert size-5" />
        {customIcon}
      </div>
    </div>
  ),
);
TimelineDot.displayName = 'TimelineDot';

const timelineCardVariants = cva(
  'flex w-full items-center justify-between rounded-3xl p-5',
  {
    variants: {
      variant: {
        empty: 'cursor-pointer border border-zinc-200 hover:bg-zinc-50',
        default: 'bg-zinc-100',
        disabled: 'bg-zinc-100 opacity-50',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

interface TimelineCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof timelineCardVariants> {
  image: string;
  title: string;
  description?: string;
  button?: ReactNode;
}

const TimelineCard = React.forwardRef<HTMLDivElement, TimelineCardProps>(
  (
    {
      className,
      variant = 'default',
      image,
      title,
      description,
      button,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        {...props}
        className={cn(timelineCardVariants({ variant }), className)}
      >
        <div className="flex items-center gap-4">
          <img
            className="size-12 min-w-12 rounded-lg object-cover"
            src={image}
            alt="service"
          />
          <div>
            <Body1>{title}</Body1>
            <Body2 className="line-clamp-1 text-zinc-500">{description}</Body2>
          </div>
        </div>
        {button}
      </div>
    );
  },
);

TimelineCard.displayName = 'TimelineCard';

const TimelineEmptyCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(
  (
    {
      className,

      ...props
    },
    ref,
  ) => {
    const navigate = useNavigate();
    return (
      <div
        ref={ref}
        {...props}
        className={cn(timelineCardVariants({ variant: 'empty' }), className)}
        role="presentation"
        onClick={() => navigate('/services')}
      >
        <>
          <div className="flex items-center gap-4">
            <div className="flex size-12 min-w-12 items-center justify-center rounded-lg">
              <PlusIcon
                width={32}
                height={32}
                color="#A1A1AA"
                strokeWidth={2}
              />
            </div>
            <Body1 className="text-zinc-500">Schedule new service</Body1>
          </div>
        </>
      </div>
    );
  },
);

TimelineEmptyCard.displayName = 'TimelineEmptyCard';

const TimelineLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex flex-col items-start px-9 sm:px-12 text-zinc-500 sm:text-base text-sm',
      className,
    )}
    {...props}
  />
));
TimelineLabel.displayName = 'TimelineLabel';

export {
  Timeline,
  TimelineItem,
  TimelineConnector,
  TimelineHeader,
  TimelineSpacer,
  TimelineDot,
  TimelineCard,
  TimelineEmptyCard,
  TimelineLabel,
  type TimelineDotVariant,
};
