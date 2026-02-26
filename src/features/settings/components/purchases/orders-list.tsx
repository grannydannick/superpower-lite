import { useNavigate } from '@tanstack/react-router';
import { format } from 'date-fns';
import { ChevronRight } from 'lucide-react';
import React, { HTMLAttributes } from 'react';

import { Card } from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Spinner } from '@/components/ui/spinner';
import { Body1, Body2 } from '@/components/ui/typography';
import { useMultiPlatformOrders } from '@/features/orders/api';
import { DateHeader } from '@/features/settings/components/purchases/date-header';
import { OrderDropDown } from '@/features/settings/components/purchases/order-dropdown';
import { OrderInvoiceContent } from '@/features/settings/components/purchases/orders-invoice-content';
import { groupOrdersByMonthAndYear } from '@/features/settings/utils/group-orders-by-month-and-year';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';
import { cn } from '@/lib/utils';
import { MultiPlatformOrder } from '@/types/api';
import { capitalize } from '@/utils/format';
import { formatMoney } from '@/utils/format-money';

export function OrdersList() {
  const { data, isLoading, error } = useMultiPlatformOrders();
  const { width } = useWindowDimensions();

  // TODO: replace this with skeletons
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

  const content = () =>
    Object.keys(groupedMultiPlatformOrders).map((date) => (
      <OrderBlock
        key={date}
        multiPlatformOrders={groupedMultiPlatformOrders[date]}
        date={date}
      />
    ));

  return width >= 768 ? (
    <Card className="p-6">{content()}</Card>
  ) : (
    <div>{content()}</div>
  );
}

interface OrderTableProps {
  multiPlatformOrders: MultiPlatformOrder[];
  date: string;
}

function OrderBlock({ multiPlatformOrders, date }: OrderTableProps) {
  return (
    <div className="border-separate border-spacing-y-3">
      <div>
        <DateHeader occurrence={date} />
      </div>
      <div className="space-y-1 md:space-y-0">
        {multiPlatformOrders.map((multiPlatformOrder) => (
          <OrderRow
            multiPlatformOrder={multiPlatformOrder}
            key={
              multiPlatformOrder.invoiceId ??
              multiPlatformOrder.invoiceUrl ??
              `${multiPlatformOrder.type}-${multiPlatformOrder.occurredAt}-${multiPlatformOrder.name}-${multiPlatformOrder.price}`
            }
          />
        ))}
      </div>
    </div>
  );
}

const OrderRow = ({
  multiPlatformOrder,
}: {
  multiPlatformOrder: MultiPlatformOrder;
}) => {
  const { width } = useWindowDimensions();

  // NOTE: If it has an invoiceId, then we can retrieve
  // details about the invoice from the server.
  // If it only has a invoiceUrl, then we can't, we link to shopify.
  const hasNativeInvoice = multiPlatformOrder.invoiceId !== undefined; // || multiPlatformOrder.invoiceUrl;

  if (!hasNativeInvoice || width >= 768) {
    return <OrderRowCard multiPlatformOrder={multiPlatformOrder} />;
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <OrderRowCard multiPlatformOrder={multiPlatformOrder} />
      </SheetTrigger>
      <SheetContent className="flex max-h-full flex-col rounded-t-[10px]">
        <SheetTitle className="sr-only">Invoice details</SheetTitle>
        <SheetDescription className="sr-only">
          View invoice details for this order.
        </SheetDescription>
        <OrderInvoiceContent multiPlatformOrder={multiPlatformOrder} />
      </SheetContent>
    </Sheet>
  );
};

interface OrderRowContentProps extends HTMLAttributes<HTMLDivElement> {
  multiPlatformOrder: MultiPlatformOrder;
}

const OrderRowCard = ({
  multiPlatformOrder,
  ...rest
}: OrderRowContentProps) => {
  const navigate = useNavigate();
  const haveInvoice =
    multiPlatformOrder.invoiceId || multiPlatformOrder.invoiceUrl;

  const isMembership = multiPlatformOrder.type === 'membership';
  const formattedOrderDate = new Date(
    multiPlatformOrder.occurredAt,
  ).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  const orderPrice = multiPlatformOrder.price;

  const onClickHandler = () => {
    if (multiPlatformOrder.type === 'service') {
      void navigate({ to: '/services' });
    }

    if (multiPlatformOrder.invoiceUrl) {
      window.open(multiPlatformOrder.invoiceUrl, '_blank');
    }

    return;
  };

  return (
    <div
      {...rest}
      className={cn(
        'flex cursor-pointer items-center rounded-2xl bg-white py-[14px] pl-5 pr-[14px] hover:bg-zinc-50',
      )}
    >
      <div className="flex items-center justify-center gap-3">
        <img
          src={
            multiPlatformOrder.image
              ? multiPlatformOrder.image
              : '/settings/membership/baseline.webp'
          }
          alt={multiPlatformOrder.image}
          className="size-12 min-w-12 rounded-[8px] border border-[#E4E4E7] object-cover object-center"
        />
        <div className="flex flex-col">
          <Body1
            className={cn(
              'line-clamp-1 text-zinc-600',
              multiPlatformOrder.type === 'service' &&
                'cursor-pointer md:hover:text-vermillion-900',
            )}
            role="presentation"
            onClick={onClickHandler}
          >
            {multiPlatformOrder.name}
          </Body1>
          <div className="flex items-center justify-start gap-1.5 text-xs text-zinc-400">
            <Body2 className="text-xs text-zinc-400 md:hidden">
              {formattedOrderDate}
            </Body2>
            <Body2 className="hidden text-xs text-zinc-400 md:block">
              {orderPrice > 0 ? formatMoney(orderPrice) : 'Included'}
            </Body2>

            {isMembership && (
              <div className="flex items-center gap-1.5 md:hidden">
                <div className="size-0.5 rounded-full bg-zinc-400" />
                <Body2 className="text-zinc-400">Yearly subscription</Body2>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="ml-auto flex items-center justify-between space-x-4">
        <div className="hidden min-w-[120px] flex-col items-start text-left lg:flex">
          <Body2 className="whitespace-nowrap">
            {format(multiPlatformOrder.occurredAt, 'PP')}
          </Body2>
          {isMembership && (
            <Body2 className="hidden text-sm text-zinc-400 lg:block">
              Yearly subscription
            </Body2>
          )}
        </div>

        <div className="hidden min-w-[120px] text-left text-sm lg:block">
          {capitalize(multiPlatformOrder.type)}
        </div>

        <div className="flex min-w-[40px] items-center justify-end">
          {haveInvoice && (
            <div className="flex items-center">
              {/* Show price only on mobile */}
              <span className="mr-2 text-sm text-zinc-400 md:hidden">
                {orderPrice > 0 ? formatMoney(orderPrice) : 'Included'}
              </span>

              <ChevronRight
                color="#A1A1AA"
                className="block size-4 text-secondary md:hidden"
                strokeWidth={2}
              />
            </div>
          )}
          <OrderDropDown multiPlatformOrder={multiPlatformOrder} />
        </div>
      </div>
    </div>
  );
};
