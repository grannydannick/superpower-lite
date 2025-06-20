import { cva, type VariantProps } from 'class-variance-authority';
import { ChevronDown } from 'lucide-react';
import { useCallback } from 'react';

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

const orderStatusBadgeVariants = cva('', {
  variants: {
    variant: {
      upcoming: 'bg-vermillion-100 text-vermillion-900',
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
  actions: { label: string; onClick: () => void }[];
  order: Order;
}

export const OrderStatusBadge = ({
  actions,
  className,
  order,
  ...props
}: OrderStatusBadgeProps): JSX.Element => {
  const variant =
    (order.status.toLowerCase() as VariantProps<
      typeof orderStatusBadgeVariants
    >['variant']) || 'upcoming';

  const { checkAdminActorAccess } = useAuthorization();
  const isAdminActor = checkAdminActorAccess();

  const hasActions = actions && actions.length > 0;
  const showDropdown = hasActions || isAdminActor;

  const handleBadgeClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.stopPropagation();
    }
  }, []);

  // If no actions and not admin (authenticated as another user), render a simple badge without dropdown
  if (!showDropdown) {
    return (
      <div
        className={cn(
          orderStatusBadgeVariants({ variant }),
          className,
          'inline-flex flex-row items-center rounded-full px-2.5 py-0.5',
        )}
        {...props}
      >
        {capitalize(variant.toLowerCase())}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div
          className={cn(
            orderStatusBadgeVariants({ variant }),
            className,
            `inline-flex flex-row items-center rounded-full px-2.5 py-0.5`,
            'cursor-pointer',
          )}
          onClick={handleBadgeClick}
          onKeyDown={handleKeyDown}
          role="button"
          tabIndex={0}
          {...props}
        >
          {capitalize(variant.toLowerCase())}
          <Button
            variant="ghost"
            className="flex size-4 p-0 hover:text-inherit"
          >
            <ChevronDown className="size-4" />
            <span className="sr-only">Open menu</span>
          </Button>
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
  const isAdminActor = checkAdminActorAccess();

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

  const handleFileUpload = useCallback(
    async (files: File[]) => {
      try {
        const file = files[0];
        const spFile = await createFile({ data: { file } });
        completeOrder({
          data: { fileId: spFile.file.id },
          orderId: order.id,
        });
      } catch (error) {
        toast.error('Failed to upload file');
      }
    },
    [createFile, completeOrder, order.id],
  );

  const handleUploadMenuItemSelect = useCallback((event: Event) => {
    event.preventDefault();
  }, []);

  const handleActionItemSelect = useCallback(
    (onClick: () => void) => (event: Event) => {
      event.preventDefault();
      onClick();
    },
    [],
  );

  return (
    <DropdownMenuContent align="end" className="w-[30px]">
      {actions?.map((action, idx) => (
        <DropdownMenuItem
          key={idx}
          onSelect={handleActionItemSelect(action.onClick)}
        >
          {action.label}
        </DropdownMenuItem>
      ))}

      {isAdminActor && (
        <FileUpload onChange={handleFileUpload}>
          <DropdownMenuItem onSelect={handleUploadMenuItemSelect}>
            Upload file
          </DropdownMenuItem>
        </FileUpload>
      )}
    </DropdownMenuContent>
  );
}
