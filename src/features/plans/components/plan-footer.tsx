import { useSearchParams } from 'react-router-dom';

import { ChevronRightIcon } from '@/components/icons/chevron-right-icon';
import { Avatar } from '@/components/ui/avatar';
import { useScrollThreshold } from '@/hooks/use-scroll-threshold';

import { useProductAvailability } from '../hooks/use-product-availability';
import { useCarePlanCart } from '../stores/care-plan-cart-store';

export const CarePlanFooter = () => {
  const { productCount, hasAvailableProducts } = useProductAvailability();
  const { selectedProducts } = useCarePlanCart();
  const [searchParams, setSearchParams] = useSearchParams();
  const isPastTopThreshold = useScrollThreshold({ thresholdPx: 50 });
  const isBeforeBottomThreshold = useScrollThreshold({
    thresholdPx: 300,
    thresholdFromBottom: true,
  });

  const isModalOpen = searchParams.get('modal') === 'checkout';
  const hasItemsInCart = selectedProducts.length > 0;
  const isVisible =
    isPastTopThreshold &&
    isBeforeBottomThreshold &&
    !isModalOpen &&
    hasAvailableProducts &&
    (productCount > 0 || hasItemsInCart);

  const handleCardClick = () => {
    setSearchParams((params) => {
      params.set('modal', 'checkout');
      return params;
    });
  };

  const getMessage = () => {
    if (hasItemsInCart) {
      return {
        line1: 'You have',
        line2: (
          <>
            <span className="font-semibold">
              {selectedProducts.length} item
              {selectedProducts.length !== 1 ? 's' : ''}
            </span>{' '}
            in your cart
          </>
        ),
      };
    }
    return {
      line1: 'Your care team has',
      line2: (
        <>
          recommended{' '}
          <span className="font-semibold">{productCount} products</span>
        </>
      ),
    };
  };

  const message = getMessage();

  return (
    <div
      className={`fixed bottom-4 right-4 z-20 transition-opacity duration-300 ease-in-out ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div
        className="cursor-pointer rounded-full border border-zinc-200 bg-zinc-800 p-4 shadow-lg transition-transform duration-200 hover:scale-105 hover:shadow-xl md:rounded-[20px] md:bg-white"
        onClick={handleCardClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCardClick();
          }
        }}
      >
        {/* Mobile layout - horizontal */}
        <div className="flex items-center gap-3 md:hidden">
          <div className="flex -space-x-2">
            <Avatar
              src="/services/doctors/doc_1.webp"
              size="small"
              className="border-2 border-white"
            />
            <Avatar
              src="/services/doctors/doc_2.webp"
              size="small"
              className="border-2 border-white"
            />
            <Avatar
              src="/services/doctors/doc_3.webp"
              size="small"
              className="border-2 border-white"
            />
          </div>
          <div className="flex-1 text-sm text-white md:text-zinc-600">
            <div>{message.line1}</div>
            <div>{message.line2}</div>
          </div>
          <ChevronRightIcon className="size-5 text-zinc-400" />
        </div>

        {/* Desktop layout - vertical */}
        <div className="hidden flex-col gap-3 md:flex">
          <div className="flex -space-x-2">
            <Avatar
              src="/services/doctors/doc_1.webp"
              size="small"
              className="border-2 border-white"
            />
            <Avatar
              src="/services/doctors/doc_2.webp"
              size="small"
              className="border-2 border-white"
            />
            <Avatar
              src="/services/doctors/doc_3.webp"
              size="small"
              className="border-2 border-white"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm text-zinc-600">
              <div>{message.line1}</div>
              <div>{message.line2}</div>
            </div>
            <ChevronRightIcon className="ml-4 size-5 text-zinc-400" />
          </div>
        </div>
      </div>
    </div>
  );
};
