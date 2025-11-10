import { ChevronRight } from 'lucide-react';
import { useParams, useSearchParams } from 'react-router-dom';

import { Body2 } from '@/components/ui/typography';
import { usePlan } from '@/features/plans/api/get-plan';
import { useCarePlanCart } from '@/features/plans/stores/care-plan-cart-store';
import { parseProductRequests } from '@/features/plans/utils/parse-product-requests';
import { useProducts } from '@/features/supplements/api';
import { useScrollThreshold } from '@/hooks/use-scroll-threshold';
import { cn } from '@/lib/utils';

import { NotificationDot } from './notification-dot';

export const DesktopCheckout = () => {
  const { selectedProducts } = useCarePlanCart();
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const planQuery = usePlan({ id: id! });
  const productsQuery = useProducts({});

  const isPastTopThreshold = useScrollThreshold({ thresholdPx: 50 });
  const isBeforeBottomThreshold = useScrollThreshold({
    thresholdPx: 300,
    thresholdFromBottom: true,
  });

  const isModalOpen = searchParams.get('modal') === 'checkout';
  const hasItemsInCart = selectedProducts.length > 0;

  const productRequests = parseProductRequests(
    planQuery.data?.actionPlan.activity ?? [],
  );
  const allProducts = productsQuery.data?.products ?? [];
  const availableProducts = allProducts.filter(
    (p) =>
      productRequests.includes(p.id) &&
      (p.inventoryQuantity === undefined ||
        p.inventoryQuantity === null ||
        p.inventoryQuantity > 0),
  );
  const productCount = productRequests.length;

  const showRecommendedProducts =
    availableProducts.length > 0 && (productCount > 0 || hasItemsInCart);

  const isVisible =
    isPastTopThreshold &&
    isBeforeBottomThreshold &&
    !isModalOpen &&
    showRecommendedProducts;

  const handleOpenCheckout = () => {
    setSearchParams((params) => {
      params.set('modal', 'checkout');
      return params;
    });
  };

  if (!showRecommendedProducts) return null;

  if (!id || !planQuery.data) return null;

  return (
    <button
      onClick={handleOpenCheckout}
      className={cn(
        'hidden lg:flex lg:flex-col pointer-events-auto items-center lg:items-start flex-row gap-4 lg:gap-0 hover:bg-zinc-50 z-10 lg:w-full lg:max-w-56 rounded-full lg:rounded-xl border border-zinc-200 bg-white p-3 shadow-lg shadow-black/5 transition-all duration-300 ease-in-out',
        isVisible
          ? 'opacity-100'
          : 'opacity-0 pointer-events-none scale-[.99] translate-y-1 translate-x-1',
      )}
    >
      <NotificationDot className="absolute right-0 top-0 hidden lg:block" />
      <div className="flex items-center -space-x-1 lg:mb-2 ">
        {Array.from({ length: 3 }, (_, index) => (
          <div
            key={index}
            className="aspect-square w-6 rounded-full bg-white p-0.5"
          >
            <img
              src={`/services/doctors/doc_${index + 1}.webp`}
              className="aspect-square w-full rounded-full"
              alt="Care team"
            />
          </div>
        ))}
      </div>
      <div className="mt-0.5 text-left text-sm">
        {hasItemsInCart ? (
          <>
            <Body2>You have</Body2>
            <Body2>
              <span className="font-semibold">
                {selectedProducts.length} item
                {selectedProducts.length !== 1 ? 's' : ''}
              </span>{' '}
              in your cart
            </Body2>
          </>
        ) : (
          <>
            <Body2>Superpower recommends</Body2>
            <Body2>
              <span className="font-semibold">
                {productCount} product{productCount > 1 ? 's' : ''} for you
              </span>
            </Body2>
            {availableProducts.length !== productCount && (
              <Body2 className="hidden lg:block">
                <span className="font-semibold">
                  {availableProducts.length} product
                  {availableProducts.length !== 1 ? 's' : ''} available
                </span>
              </Body2>
            )}
          </>
        )}
      </div>
      <ChevronRight className="ml-auto text-zinc-400 lg:hidden" />
    </button>
  );
};
