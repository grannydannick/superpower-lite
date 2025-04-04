import { X } from 'lucide-react';
import { ReactNode } from 'react';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Body1, H2 } from '@/components/ui/typography';
import { useProducts } from '@/features/plans/api';
import { useCarePlan } from '@/features/plans/context/care-plan-context';
import { parseProductRequests } from '@/features/plans/utils/parse-product-requests';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';

import { ReviewStep } from './steps/review-step';

export const ActionPlanCheckoutModal = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { width } = useWindowDimensions();
  const { plan } = useCarePlan();
  const { data: productsData } = useProducts({});

  const productRequests = parseProductRequests(plan.activity ?? []);

  const unavailableCount = productRequests.reduce((count, productId) => {
    const productExists = productsData?.products?.some(
      (p) => p.id === productId,
    );
    return productExists ? count : count + 1;
  }, 0);

  const checkoutTitle =
    unavailableCount > 0
      ? `Checkout (${unavailableCount} unavailable)`
      : 'Checkout';

  if (width <= 768) {
    return (
      <Sheet>
        <SheetTrigger asChild>{children}</SheetTrigger>
        <SheetContent className="flex max-h-full flex-col rounded-t-[10px]">
          <div className="flex items-center justify-between px-4 pt-16 md:pb-4">
            <SheetClose>
              <div className="flex h-[44px] min-w-[44px] items-center justify-center rounded-full bg-zinc-50">
                <X className="h-4 min-w-4" />
              </div>
            </SheetClose>
            <Body1>Action plan</Body1>
            <div className="min-w-[44px]" />
          </div>
          <div className="overflow-auto">
            <ReviewStep />
          </div>
        </SheetContent>
      </Sheet>
    );
  }
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <div className="flex flex-col">
          <div className="flex w-full items-center justify-between md:px-11 md:pb-6 md:pt-10">
            <Body1 className="text-zinc-500">Action plan</Body1>
            <DialogClose>
              <X
                className="size-6 cursor-pointer p-1 text-zinc-500"
                strokeWidth={3}
              />
            </DialogClose>
          </div>
          <div className="px-10 pt-2">
            <H2>{checkoutTitle}</H2>
          </div>
        </div>
        <ReviewStep />
      </DialogContent>
    </Dialog>
  );
};
