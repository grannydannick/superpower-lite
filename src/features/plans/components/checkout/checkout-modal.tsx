import { X } from 'lucide-react';
import { ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
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
import { useProductAvailability } from '@/features/plans/hooks/use-product-availability';
import { useCarePlanCart } from '@/features/plans/stores/care-plan-cart-store';
import { useProducts } from '@/features/shop/api';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';

import { ReviewStep } from './steps/review-step';

/**
 * URL-controlled checkout modal that can be opened from anywhere in the app
 *
 * Usage:
 * 1. Wrap any trigger element as children:
 *    <ActionPlanCheckoutModal>
 *      <Button>Open Checkout</Button>
 *    </ActionPlanCheckoutModal>
 *
 * 2. Or trigger programmatically from anywhere:
 *    import { useSearchParams } from 'react-router-dom';
 *    const [, setSearchParams] = useSearchParams();
 *
 *    // Open modal
 *    setSearchParams((params) => {
 *      params.set('modal', 'checkout');
 *      return params;
 *    });
 *
 *    // Close modal
 *    setSearchParams((params) => {
 *      params.delete('modal');
 *      return params;
 *    });
 *
 * The modal state is controlled by the URL parameter 'modal=checkout'
 */
export const ActionPlanCheckoutModal = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { width } = useWindowDimensions();
  const { unavailableProductCount } = useProductAvailability();
  const [searchParams, setSearchParams] = useSearchParams();

  const isOpen = searchParams.get('modal') === 'checkout';

  const handleOpen = () => {
    setSearchParams((params) => {
      params.set('modal', 'checkout');
      return params;
    });
  };

  const handleClose = () => {
    setSearchParams((params) => {
      params.delete('modal');
      return params;
    });
  };

  const checkoutTitle =
    unavailableProductCount > 0
      ? `Checkout (${unavailableProductCount} unavailable)`
      : 'Checkout';

  const { productRequests } = useProductAvailability();
  const getProductsQuery = useProducts({});
  const { selectedProducts, addAllProducts, clearAllItems } = useCarePlanCart();

  // Compute the products that are available for selection
  const sortedProducts =
    getProductsQuery.data?.products.filter((p) =>
      productRequests.includes(p.id),
    ) ?? [];

  const handleToggleAll = () => {
    if (selectedProducts.length === sortedProducts.length) {
      clearAllItems();
    } else {
      addAllProducts(sortedProducts);
    }
  };

  if (width <= 768) {
    return (
      <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <SheetTrigger asChild onClick={handleOpen}>
          {children}
        </SheetTrigger>
        <SheetContent
          className="flex max-h-full flex-col rounded-t-[10px]"
          preventCloseAutoFocus
        >
          <div className="flex items-center justify-between px-4 pt-10 md:pb-4">
            <SheetClose onClick={handleClose}>
              <div className="flex h-[44px] min-w-[44px] items-center justify-center rounded-full bg-zinc-50">
                <X className="h-4 min-w-4" />
              </div>
            </SheetClose>
            <Body1>Action plan</Body1>
            <div className="min-w-[44px]" />
          </div>
          <div className="flex items-center justify-between px-6 pt-4">
            <H2>{checkoutTitle}</H2>
            {sortedProducts.length > 0 && (
              <Button
                variant="outline"
                size="small"
                onClick={handleToggleAll}
                className="ml-4 text-xs"
              >
                {selectedProducts.length === sortedProducts.length
                  ? 'Clear all'
                  : 'Add all'}
              </Button>
            )}
          </div>
          <div className="flex min-h-0 flex-1 flex-col">
            <ReviewStep />
          </div>
        </SheetContent>
      </Sheet>
    );
  }
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogTrigger asChild onClick={handleOpen}>
        {children}
      </DialogTrigger>
      <DialogContent preventCloseAutoFocus>
        <div className="flex flex-col">
          <div className="flex w-full items-center justify-between md:px-10 md:pb-6 md:pt-10">
            <Body1 className="text-zinc-500">Action plan</Body1>
            <DialogClose onClick={handleClose}>
              <X
                className="size-6 cursor-pointer p-1 text-zinc-500"
                strokeWidth={3}
              />
            </DialogClose>
          </div>
          <div className="flex items-center justify-between px-10 pt-2">
            <H2>{checkoutTitle}</H2>
            {sortedProducts.length > 0 && (
              <Button
                variant="outline"
                size="small"
                onClick={handleToggleAll}
                className="ml-4 text-xs"
              >
                {selectedProducts.length === sortedProducts.length
                  ? 'Clear all'
                  : 'Add all'}
              </Button>
            )}
          </div>
        </div>
        <ReviewStep />
      </DialogContent>
    </Dialog>
  );
};
