import { EllipsisVertical } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown';
import { useSubscriptions, useInvoice } from '@/features/settings/api';
import { CancelMembershipDialog } from '@/features/settings/components/membership/cancel-membership-dialog';
import { OrderInvoiceDialogContent } from '@/features/settings/components/purchases/orders-invoice-dialog-content';
import { MultiPlatformOrder, Subscription } from '@/types/api';

interface OrderDropDownProps {
  multiPlatformOrder: MultiPlatformOrder;
}
export const OrderDropDown = ({ multiPlatformOrder }: OrderDropDownProps) => {
  const { invoiceUrl, invoiceId, type } = multiPlatformOrder;
  const invoiceQuery = useInvoice({
    invoiceId: invoiceId as string,
    queryConfig: { enabled: !!invoiceId },
  });
  const { data: subscriptionsData } = useSubscriptions({});
  const superpowerMembership = subscriptionsData?.subscriptions.find(
    (subscription) => subscription.name === 'membership',
  );

  if (!invoiceUrl && !invoiceId) return null;

  const downloadInvoice = async (): Promise<void> => {
    if (!invoiceId) {
      return;
    }

    if (invoiceQuery.data?.invoice?.invoice_pdf) {
      window.open(
        invoiceQuery.data?.invoice?.invoice_pdf,
        '_blank',
        'noreferrer',
      );
    } else {
      toast.error(`Can't download at the moment, try again later!`);
    }
  };

  const openShopifyInvoice = (): void => {
    if (!invoiceUrl) {
      return;
    }

    window.open(invoiceUrl, '_blank', 'noreferrer');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="hidden md:block">
          <EllipsisVertical
            color="#A1A1AA"
            className="hidden size-4 text-secondary data-[state=open]:bg-muted md:block"
          />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[160px] rounded-[16px] border-none"
      >
        {invoiceId ? (
          <SeeDetailsMenuItem multiPlatformOrder={multiPlatformOrder} />
        ) : (
          <DropdownMenuItem onClick={openShopifyInvoice}>
            See details
          </DropdownMenuItem>
        )}
        {invoiceId && (
          <DropdownMenuItem onClick={downloadInvoice}>
            Download invoice
          </DropdownMenuItem>
        )}
        {type === 'membership' &&
          superpowerMembership &&
          superpowerMembership.status === 'active' && (
            <UnsubscribeMenuItem superpowerMembership={superpowerMembership} />
          )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const SeeDetailsMenuItem = ({
  multiPlatformOrder,
}: {
  multiPlatformOrder: MultiPlatformOrder;
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault();
          }}
        >
          See details
        </DropdownMenuItem>
      </DialogTrigger>
      <OrderInvoiceDialogContent multiPlatformOrder={multiPlatformOrder} />
    </Dialog>
  );
};

const UnsubscribeMenuItem = ({
  superpowerMembership,
}: {
  superpowerMembership: Subscription;
}) => {
  return (
    <CancelMembershipDialog membership={superpowerMembership}>
      <DropdownMenuItem
        className="text-pink-700 focus:bg-pink-50 focus:text-pink-700"
        onSelect={(event) => {
          event.preventDefault();
        }}
      >
        Unsubscribe
      </DropdownMenuItem>
    </CancelMembershipDialog>
  );
};
