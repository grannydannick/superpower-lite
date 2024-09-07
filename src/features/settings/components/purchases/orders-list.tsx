import { format } from 'date-fns';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Card } from '@/components/ui/card';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Body1, Body2 } from '@/components/ui/typography';
import { useMultiPlatformOrders } from '@/features/orders/api';
import { DateHeader } from '@/features/settings/components/purchases/date-header';
import { OrderDropDown } from '@/features/settings/components/purchases/order-dropdown';
import { OrderInvoiceDialogContent } from '@/features/settings/components/purchases/orders-invoice-dialog-content';
import { groupOrdersByMonthAndYear } from '@/features/settings/utils/group-orders-by-month-and-year';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';
import { cn } from '@/lib/utils';
import { MultiPlatformOrder } from '@/types/api';
import { capitalize } from '@/utils/format';
import { formatMoney } from '@/utils/format-money';

export function OrdersList(): JSX.Element {
  const { data, isLoading, error } = useMultiPlatformOrders();
  const { width } = useWindowDimensions();

  if (isLoading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner variant="primary" size="lg" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <h1 className="text-base text-secondary">
          {error?.message ?? 'We failed to load your orders.'}
        </h1>
      </div>
    );
  }

  const { multiPlatformOrders } = data;

  if (multiPlatformOrders.length === 0)
    return <p className="text-secondary">No Orders.</p>;

  const groupedMultiPlatformOrders =
    groupOrdersByMonthAndYear(multiPlatformOrders);

  const content = (): JSX.Element[] =>
    Object.keys(groupedMultiPlatformOrders).map((date, index) => (
      <OrderBlock
        key={index}
        multiPlatformOrders={groupedMultiPlatformOrders[date]}
        date={date}
      />
    ));

  return width > 769 ? (
    <Card className="p-6">{content()}</Card>
  ) : (
    <div>{content()}</div>
  );
}

interface OrderTableProps {
  multiPlatformOrders: MultiPlatformOrder[];
  date: string;
}

function OrderBlock({
  multiPlatformOrders,
  date,
}: OrderTableProps): JSX.Element {
  return (
    <Table className="border-separate border-spacing-y-3">
      <TableBody>
        <DateHeader occurrence={date} />
      </TableBody>
      <TableBody>
        {multiPlatformOrders.map((multiPlatformOrder, index) => (
          <OrderRow multiPlatformOrder={multiPlatformOrder} key={index} />
        ))}
      </TableBody>
    </Table>
  );
}

const OrderRow = ({
  multiPlatformOrder,
}: {
  multiPlatformOrder: MultiPlatformOrder;
}) => {
  const navigate = useNavigate();
  const haveInvoice =
    multiPlatformOrder.invoiceId || multiPlatformOrder.invoiceUrl;
  return (
    <TableRow className="bg-white hover:bg-white md:bg-none">
      <TableCell className="rounded-l-2xl">
        <div className="flex items-center gap-3">
          <img
            src={
              multiPlatformOrder.image
                ? multiPlatformOrder.image
                : '/settings/membership/card-2024.png'
            }
            alt={multiPlatformOrder.image}
            className="size-12 min-w-12 rounded-[8px] border border-[#E4E4E7] object-cover object-center"
          />
          <div>
            <Body1
              className={cn(
                'text-zinc-600 line-clamp-1',
                multiPlatformOrder.type === 'service' &&
                  'md:hover:text-vermillion-900 cursor-pointer',
              )}
              role="presentation"
              onClick={() =>
                multiPlatformOrder.type === 'service' &&
                navigate('/app/services')
              }
            >
              {multiPlatformOrder.name}
            </Body1>
            <div className="flex items-center gap-1.5">
              <Body2 className="hidden text-zinc-400 md:block">
                {multiPlatformOrder.price === 0
                  ? 'Included'
                  : formatMoney(multiPlatformOrder.price)}
              </Body2>
              <Body2 className="text-nowrap text-zinc-400 md:hidden">
                {format(multiPlatformOrder.occurredAt, 'PP')}
              </Body2>
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell className="hidden lg:table-cell">
        <h3 className="hidden text-sm text-[#52525B] md:block lg:text-base">
          {format(multiPlatformOrder.occurredAt, 'PP')}
        </h3>

        <h3 className="text-sm text-[#52525B] md:hidden lg:text-base">
          {multiPlatformOrder.price === 0
            ? 'Included'
            : formatMoney(multiPlatformOrder.price)}
        </h3>
        {multiPlatformOrder.type === 'membership' && (
          <h3 className="hidden text-nowrap text-xs text-[#A1A1AA] md:block lg:text-sm">
            Yearly subscription
          </h3>
        )}
      </TableCell>
      <TableCell className="hidden lg:table-cell">
        <h3 className="text-base text-[#52525B]">
          {capitalize(multiPlatformOrder.type)}
        </h3>
      </TableCell>
      <TableCell className="rounded-r-2xl">
        <div className="flex items-center">
          <OrderDropDown multiPlatformOrder={multiPlatformOrder} />
          {haveInvoice && (
            <Dialog>
              <OrderInvoiceDialogContent
                multiPlatformOrder={multiPlatformOrder}
              />
              <DialogTrigger>
                <ChevronRight
                  color="#A1A1AA"
                  className="block size-4 text-secondary md:hidden"
                />
              </DialogTrigger>
            </Dialog>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};
