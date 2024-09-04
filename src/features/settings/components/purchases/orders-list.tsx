import { format } from 'date-fns';
import { ChevronRight, Dot } from 'lucide-react';
import { Fragment } from 'react';
import { useNavigate } from 'react-router-dom';

import { Card } from '@/components/ui/card';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { Body1, Body2 } from '@/components/ui/typography';
import { useMultiPlatformOrders } from '@/features/orders/api/get-multi-platform-orders';
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
    <div>
      <DateHeader occurrence={date} />
      <div>
        {multiPlatformOrders.map((multiPlatformOrder, index) =>
          multiPlatformOrder.invoiceId ? (
            <Dialog key={index}>
              <DialogTrigger asChild>
                <OrderCard multiPlatformOrder={multiPlatformOrder} />
              </DialogTrigger>
              <OrderInvoiceDialogContent
                multiPlatformOrder={multiPlatformOrder}
              />
            </Dialog>
          ) : (
            <OrderCard multiPlatformOrder={multiPlatformOrder} key={index} />
          ),
        )}
      </div>
    </div>
  );
}

const OrderCard = ({
  multiPlatformOrder,
}: {
  multiPlatformOrder: MultiPlatformOrder;
}) => {
  const navigate = useNavigate();
  const haveInvoice =
    multiPlatformOrder.invoiceId || multiPlatformOrder.invoiceUrl;
  return (
    <>
      <div className="flex items-center justify-between bg-white p-3 hover:bg-white md:bg-none md:p-6">
        <div className="flex w-1/3 items-center gap-3">
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
              {multiPlatformOrder.type === 'membership' && (
                <>
                  <Dot className="size-4 text-[#A1A1AA] md:hidden" />
                  <Body2 className="text-nowrap text-zinc-400 md:hidden">
                    Yearly subscription
                  </Body2>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="ml-auto grid grid-cols-2 gap-12 md:grid-cols-3">
          <div className="flex flex-col justify-center">
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
          </div>
          <div className="hidden items-center justify-center lg:flex">
            <h3 className="text-base text-[#52525B]">
              {capitalize(multiPlatformOrder.type)}
            </h3>
          </div>
          <div className="flex w-9 items-center justify-self-end">
            <>
              <OrderDropDown multiPlatformOrder={multiPlatformOrder} />
              {haveInvoice && (
                <ChevronRight
                  color="#A1A1AA"
                  className="block size-4 text-secondary md:hidden"
                />
              )}
            </>
          </div>
        </div>
      </div>
    </>
  );
};
