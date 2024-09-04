import { EllipsisVertical } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { DialogTrigger } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown';
import { useInvoice } from '@/features/settings/api/get-invoice';
import { CancelMembershipDialog } from '@/features/settings/components/membership/cancel-membership-dialog';
import { useSubscriptions } from '@/shared/api/get-subscriptions';
import { MultiPlatformOrder } from '@/types/api';

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
          <DialogTrigger asChild>
            <DropdownMenuItem className="cursor-pointer rounded-[8px] p-4 hover:bg-[#F7F7F7]">
              See details
            </DropdownMenuItem>
          </DialogTrigger>
        ) : (
          <DropdownMenuItem
            className="cursor-pointer rounded-[8px] p-4 hover:bg-[#F7F7F7]"
            onClick={openShopifyInvoice}
          >
            See details
          </DropdownMenuItem>
        )}
        {invoiceId && (
          <DropdownMenuItem
            className="cursor-pointer rounded-[8px] p-4 hover:bg-[#F7F7F7]"
            onClick={downloadInvoice}
          >
            Download invoice
          </DropdownMenuItem>
        )}
        {type === 'membership' &&
          superpowerMembership &&
          superpowerMembership.status === 'active' && (
            <CancelMembershipDialog membership={superpowerMembership}>
              <DropdownMenuItem
                onSelect={(event) => {
                  event.preventDefault();
                }}
                className="cursor-pointer rounded-[8px] p-4 text-[#B90090] hover:!bg-[#FFF3F6] hover:!text-[#B90090]"
              >
                Unsubscribe
              </DropdownMenuItem>
            </CancelMembershipDialog>
          )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
