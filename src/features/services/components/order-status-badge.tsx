import { cva, type VariantProps } from 'class-variance-authority';
import { ChevronDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown';
import { cn } from '@/lib/utils';
import { capitalize } from '@/utils/format';

const orderStatusBadgeVariants = cva(
  'm-0 inline-block px-2 py-[3px] text-sm text-primary',
  {
    variants: {
      variant: {
        upcoming: 'bg-vermillion-100 text-vermillion-900',
        completed: 'bg-green-50 text-green-700',
        cancelled: 'bg-zinc-200 hover:bg-zinc-200/70',
      },
    },
    defaultVariants: {
      variant: 'upcoming',
    },
  },
);

export interface OrderStatusBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof orderStatusBadgeVariants> {
  actions: { label: string; onClick: () => void }[];
}

export const OrderStatusBadge = ({
  actions,
  className,
  variant,
  ...props
}: OrderStatusBadgeProps): JSX.Element => {
  if (!variant) throw Error('OrderStatusBadge variant was not provided.');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div
          className={cn(
            orderStatusBadgeVariants({ variant }),
            className,
            `inline-flex flex-row items-center rounded-full px-2.5 py-0.5-pointer`,
            actions.length > 0 ? 'cursor-pointer' : null,
          )}
          {...props}
        >
          {capitalize(variant.toLowerCase())}
          {actions.length > 0 ? (
            <Button
              variant="ghost"
              className="flex size-4 p-0 hover:text-inherit"
            >
              <ChevronDown className="size-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          ) : null}
        </div>
      </DropdownMenuTrigger>
      <OrderCardActions actions={actions} />
    </DropdownMenu>
  );
};

function OrderCardActions({
  actions,
}: {
  actions?: { label: string; onClick: () => void }[];
}) {
  if (!actions || actions.length === 0) return <></>;

  return (
    <DropdownMenuContent align="end" className="w-[30px]">
      {actions.map((action, idx) => (
        <DropdownMenuItem key={idx} onClick={() => action.onClick()}>
          {action.label}
        </DropdownMenuItem>
      ))}
    </DropdownMenuContent>
  );
}
