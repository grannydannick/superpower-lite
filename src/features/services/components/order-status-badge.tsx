import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';
import { Order } from '@/types/api';
import { capitalize } from '@/utils/format';

const orderStatusBadgeVariants = cva('', {
  variants: {
    variant: {
      upcoming: 'bg-vermillion-100 text-vermillion-900',
      walkin: 'bg-vermillion-100 text-vermillion-900',
      completed: 'bg-green-50 text-green-700',
      cancelled: 'bg-zinc-200',
    },
  },
  defaultVariants: {
    variant: 'upcoming',
  },
});

export interface OrderStatusBadgeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  order: Order;
}

export const OrderStatusBadge = ({
  className,
  order,
  ...props
}: OrderStatusBadgeProps): JSX.Element => {
  const variant =
    (order.status.toLowerCase() as VariantProps<
      typeof orderStatusBadgeVariants
    >['variant']) || 'upcoming';

  return (
    <div
      className={cn(
        orderStatusBadgeVariants({ variant }),
        className,
        `inline-flex flex-row items-center rounded-full px-2.5 py-0.5`,
        'cursor-pointer',
      )}
      role="button"
      tabIndex={0}
      {...props}
    >
      {order.appointmentType === 'UNSCHEDULED'
        ? 'WALK IN'
        : capitalize(variant.toLowerCase())}
    </div>
  );
};
