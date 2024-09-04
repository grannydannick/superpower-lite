import { format } from 'date-fns';
import { X } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import { DialogClose, DialogContent } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Body1 } from '@/components/ui/typography';
import { useInvoice } from '@/features/settings/api/get-invoice';
import { MultiPlatformOrder } from '@/types/api';
import { formatMoney } from '@/utils/format-money';

interface OrderInvoiceDialogContentProps {
  multiPlatformOrder: MultiPlatformOrder;
}

export const OrderInvoiceDialogContent = ({
  multiPlatformOrder,
}: OrderInvoiceDialogContentProps) => {
  const invoiceQuery = useInvoice({
    invoiceId: multiPlatformOrder.invoiceId as string,
    queryConfig: { enabled: !!multiPlatformOrder.invoiceId },
  });

  if (!invoiceQuery.data) {
    return null;
  }

  const invoice = invoiceQuery.data.invoice;

  const finalInfo = [
    {
      title: 'Total',
      value: formatMoney(invoice.total),
      color: 'text-zinc-400',
    },
    {
      title: 'Paid',
      value: formatMoney(invoice.amount_paid),
      color: 'text-zinc-500',
    },
  ];

  return (
    <DialogContent className="px-14 py-12">
      <div className="flex justify-between pb-6">
        <h3 className="text-base text-[#71717A]">Order history</h3>
        <DialogClose className="outline-none">
          <X className="size-6 cursor-pointer p-1" />
        </DialogClose>
      </div>
      <div className="flex max-w-[391px] flex-col gap-4 pt-12">
        {invoiceQuery.isPending ? (
          <Skeleton className="h-[36px] w-full" />
        ) : (
          <h1 className="text-3xl text-[#18181B]">
            Invoice #{invoice?.number}
          </h1>
        )}
        {/*<h1 className="text-base text-[#71717A]">*/}
        {/*  You have <span className="text-[#FC5F2B]">41 days</span> to enjoy your membership benefits until the next*/}
        {/*  billing cycle.{' '}*/}
        {/*</h1>*/}
      </div>
      <Table className="py-12">
        <TableHeader>
          <TableRow>
            <TableHead className="text-base text-zinc-400">
              Description
            </TableHead>
            <TableHead className="hidden text-base text-zinc-400 sm:table-cell">
              Date
            </TableHead>
            <TableHead className="hidden text-base text-zinc-400 sm:table-cell">
              Price
            </TableHead>
            <TableHead className="hidden text-base text-zinc-400 sm:table-cell">
              Qty
            </TableHead>
            <TableHead className="text-base text-zinc-400">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoice.lines.map((line, index) => (
            <TableRow className="border-b hover:bg-transparent" key={index}>
              <TableCell className="pl-0">
                <div>
                  {invoiceQuery.isPending ? (
                    <Skeleton className="h-6 w-full" />
                  ) : (
                    <Body1 className="text-zinc-700">{line.description}</Body1>
                  )}
                </div>
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                {invoiceQuery.isPending ? (
                  <Skeleton className="h-6 w-full" />
                ) : (
                  <Body1 className="text-zinc-700">
                    {format(invoice.created * 1000, 'PP')}
                  </Body1>
                )}
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                {invoiceQuery.isPending ? (
                  <Skeleton className="h-6 w-full" />
                ) : (
                  <Body1 className="text-zinc-700">
                    {line.price ? formatMoney(line.price) : 0}
                  </Body1>
                )}
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                {invoiceQuery.isPending ? (
                  <Skeleton className="h-6 w-full" />
                ) : (
                  <Body1 className="text-zinc-700">1</Body1>
                )}
              </TableCell>
              <TableCell className="pr-0">
                {invoiceQuery.isPending ? (
                  <Skeleton className="h-6 w-full" />
                ) : (
                  <Body1 className="text-zinc-700">
                    {line.price ? formatMoney(line.price) : 0}
                  </Body1>
                )}
              </TableCell>
            </TableRow>
          ))}
          {finalInfo.map((item, index) => (
            <TableRow className="border-b hover:bg-transparent" key={index}>
              <TableCell className="hidden py-3 pl-0 sm:table-cell" />
              <TableCell className="hidden py-3 sm:table-cell" />
              <TableCell className="py-3">
                {invoiceQuery.isPending ? (
                  <Skeleton className="h-6 w-full" />
                ) : (
                  <h3 className="text-base text-zinc-400">{item.title}</h3>
                )}
              </TableCell>
              <TableCell className="hidden py-3 sm:table-cell" />
              <TableCell className="py-3 pr-0">
                {invoiceQuery.isPending ? (
                  <Skeleton className="h-6 w-full" />
                ) : (
                  <Body1 className={item.color}>{item.value}</Body1>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex justify-between pt-12">
        <div />
        {/*<Button variant="outline">Cancel membership</Button>*/}
        <div className="flex gap-4">
          {/*<Button variant="outline">Get help</Button>*/}
          {invoice?.invoice_pdf && (
            <Button onClick={() => window.open(invoice.invoice_pdf as string)}>
              Download PDF
            </Button>
          )}
        </div>
      </div>
    </DialogContent>
  );
};
