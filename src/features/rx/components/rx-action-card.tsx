import { cva, VariantProps } from 'class-variance-authority';
import { ChevronRight } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Link } from '@/components/ui/link';
import { Body1, Body2, H3 } from '@/components/ui/typography';
import { cn } from '@/lib/utils';

const RX_ACTION_CARD_CONFIG = {
  FAILED_PAYMENT: {
    title: 'Update your payment method',
    description: 'Failed to collect payment',
    extendedDescription:
      'Your RX payment did not go through, so we can not process refills or shipments until you update the primary card on file.',
    imageUrl: 'rx/cards/payment.png',
    imageClassName: 'w-[44px] h-[28px] mx-1.5 my-[14px]',
    url: '/settings?tab=billing',
    actionBtn: 'Fix now',
  },
};

const cardVariants = cva(
  'group relative flex items-center gap-3 rounded-[20px] px-4 py-2',
  {
    variants: {
      variant: {
        highlighted:
          'border border-vermillion-900 bg-white shadow-[0_0_4px_0_rgba(252,95,43,0.5)]',
        default: '',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface RxActionCardProps extends VariantProps<typeof cardVariants> {
  config: 'FAILED_PAYMENT';
  className?: string;
}

export const RxActionCard = ({
  config,
  variant,
  className,
}: RxActionCardProps) => {
  const data = RX_ACTION_CARD_CONFIG[config];

  return (
    <Link to={data.url} className={cn(cardVariants({ variant, className }))}>
      <div className="flex shrink-0 items-center">
        <div className="relative flex size-4 items-center justify-center rounded-full bg-vermillion-100">
          <div className="size-1.5 rounded-full bg-vermillion-900" />
        </div>
        <img
          src={data.imageUrl}
          alt={data.title}
          className={cn(data.imageClassName, 'object-cover')}
        />
      </div>
      <div className="flex flex-1 items-center gap-3">
        <div className="flex-1">
          <Body1 className="text-zinc-900">{data.title}</Body1>
          <Body2 className="text-secondary">{data.description}</Body2>
        </div>
        <ChevronRight className="size-5 text-zinc-400 transition-all group-hover:-mr-1" />
      </div>
    </Link>
  );
};

export const RxActionDialog = ({
  config,
  onOpenChange,
}: {
  config: 'FAILED_PAYMENT';
  onOpenChange?: (next: boolean) => void;
}) => {
  const [open, setOpen] = useState(true);
  const data = RX_ACTION_CARD_CONFIG[config];

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        onOpenChange?.(next);
      }}
    >
      <DialogContent className="w-full max-w-[592px] px-[42px] pb-6 pt-10">
        <div className="flex flex-col items-center gap-6">
          <img
            src={'rx/delivery.webp'}
            alt={data.title}
            className="size-[287px] rounded-md object-cover"
          />
          <div className="space-y-1.5 text-center">
            <H3>{data.title}</H3>
            <Body1 className="text-secondary">{data.extendedDescription}</Body1>
          </div>
          <div className="flex w-full flex-col gap-2">
            <Button
              className="w-full rounded-full"
              asChild
              onClick={() => setOpen(false)}
            >
              <Link to={data.url}>{data.actionBtn}</Link>
            </Button>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Remind me later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
