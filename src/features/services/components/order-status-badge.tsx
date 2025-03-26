import { cva, type VariantProps } from 'class-variance-authority';
import { ChevronDown } from 'lucide-react';

import { FileUpload } from '@/components/shared/upload-wrapper';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown';
import { toast } from '@/components/ui/sonner';
import { useCreateFile } from '@/features/files/api';
import { useCompleteOrder } from '@/features/orders/api/complete-order';
import { useAuthorization } from '@/lib/authorization';
import { cn } from '@/lib/utils';
import { Order } from '@/types/api';
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
  order: Order;
}

export const OrderStatusBadge = ({
  actions,
  className,
  variant,
  order,
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
      <OrderCardActions actions={actions} order={order} />
    </DropdownMenu>
  );
};

function OrderCardActions({
  order,
  actions,
}: {
  order: Order;
  actions?: { label: string; onClick: () => void }[];
}) {
  const { checkAdminActorAccess } = useAuthorization();
  const { mutateAsync: createFile } = useCreateFile({
    mutationConfig: {
      onSuccess: () => {
        toast.success('Added file!');
      },
    },
  });
  const { mutate: completeOrder } = useCompleteOrder({
    mutationConfig: {
      onSuccess: () => {
        toast.success('Completed order!');
      },
    },
  });

  if (!actions || actions.length === 0) return <></>;

  const isAdmin = checkAdminActorAccess();

  return (
    <DropdownMenuContent align="end" className="w-[30px]">
      {actions.map((action, idx) => (
        <DropdownMenuItem key={idx} onClick={() => action.onClick()}>
          {action.label}
        </DropdownMenuItem>
      ))}
      {isAdmin && (
        <FileUpload
          onChange={async (files) => {
            const file = files[0];
            const spFile = await createFile({ data: { file } });
            completeOrder({
              data: { fileId: spFile.file.id },
              orderId: order.id,
            });
          }}
        >
          <DropdownMenuItem>Upload file</DropdownMenuItem>
        </FileUpload>
      )}
    </DropdownMenuContent>
  );
}
