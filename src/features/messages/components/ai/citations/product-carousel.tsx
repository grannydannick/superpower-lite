import { ChevronLeft, ChevronRight } from 'lucide-react';
import { memo, useCallback, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselMainContainer,
  SliderMainItem,
  useCarousel,
} from '@/components/ui/carousel';
import { ProgressiveImage } from '@/components/ui/progressive-image';
import { getPricingDetails } from '@/features/supplements/utils/get-pricing-details';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import type { HealthcareService, Product, Rx } from '@/types/api';
import { getPrescriptionImage } from '@/utils/prescription';
import { getServiceImage } from '@/utils/service';

import type { CitationInfo } from '../../../types/message-parts';
import { getProductUrl } from '../../../utils/get-product-url';
import {
  FALLBACK_SUPPLEMENT_IMAGE,
  isHealthcareService,
  isProduct,
} from '../../../utils/product-utils';

interface ProductWithCitation {
  product: Product | Rx | HealthcareService;
  citation: CitationInfo;
}

interface ProductCarouselProps {
  messageId?: string; // Kept for backwards compatibility
  products: ProductWithCitation[];
}

/**
 * Get the image for a marketplace product.
 */
function getProductImage(product: Product | Rx | HealthcareService): string {
  if (isProduct(product)) {
    return product.image ?? FALLBACK_SUPPLEMENT_IMAGE;
  }
  if (isHealthcareService(product)) {
    return getServiceImage(product.name);
  }
  // Rx
  return getPrescriptionImage(product.name);
}

/**
 * Get the subtitle for a marketplace product (vendor, type, or category).
 */
function getProductSubtitle(product: Product | Rx | HealthcareService): string {
  if (isProduct(product)) {
    return product.vendor ?? product.type ?? '';
  }
  if (isHealthcareService(product)) {
    return product.additionalClassification?.[0] ?? '';
  }
  // Rx - use category, not type (type is "healthcare-service")
  return product.additionalClassification?.[0] ?? '';
}

/**
 * Product card component.
 */
const ProductCard = memo(function ProductCard({
  product,
}: {
  product: Product | Rx | HealthcareService;
}) {
  // Services have prices in cents, supplements/rx in dollars
  const isService = isHealthcareService(product);

  const pricingDetails = isProduct(product)
    ? getPricingDetails(product)
    : {
        hasDiscount: false,
        discountedPrice: isService ? product.price / 100 : product.price ?? 0,
      };

  const { hasDiscount, discountedPrice } = pricingDetails;
  const originalPrice = isProduct(product)
    ? product.price
    : isService
      ? product.price / 100
      : product.price ?? 0;
  const discount = isProduct(product) ? product.discount : 0;

  const productUrl = getProductUrl(product);
  const productImage = getProductImage(product);
  const subtitle = getProductSubtitle(product);

  return (
    <a
      href={productUrl}
      target="_blank"
      rel="noreferrer"
      className="group flex flex-col gap-2 sm:gap-3"
    >
      {/* Image container - fixed height */}
      <div className="relative flex h-[220px] items-center justify-center overflow-hidden rounded-2xl border border-zinc-200 bg-white p-4 shadow-[0px_2px_2px_0px_rgba(0,0,0,0.02)] sm:h-[280px]">
        <ProgressiveImage
          src={productImage}
          alt={product.name}
          className="max-h-[220px] max-w-full object-contain"
        />

        {/* View button on hover - desktop only */}
        <div className="pointer-events-none absolute inset-x-4 bottom-3 hidden translate-y-2 opacity-0 transition-all duration-200 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 sm:block">
          <Button className="w-full" size="medium">
            View
          </Button>
        </div>
      </div>

      {/* Product info */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm leading-5 text-zinc-900 sm:text-base sm:leading-[22px]">
            {product.name}
          </p>
          <p className="text-xs leading-4 text-zinc-500 sm:text-sm sm:leading-5">
            {subtitle}
          </p>
        </div>

        <div className="shrink-0 text-right">
          <div className="flex items-baseline gap-1">
            {hasDiscount && (
              <span className="text-xs text-zinc-500 line-through sm:text-sm">
                ${originalPrice}
              </span>
            )}
            <span className="text-sm text-zinc-900 sm:text-base">
              ${hasDiscount ? discountedPrice.toFixed(0) : originalPrice}
            </span>
          </div>
          {hasDiscount && discount > 0 && (
            <span className="text-xs text-vermillion-900 sm:text-sm">
              -{discount}%
            </span>
          )}
        </div>
      </div>
    </a>
  );
});

/**
 * Carousel navigation arrows.
 */
const NavArrow = memo(function NavArrow({
  direction,
  onClick,
  visible,
}: {
  direction: 'prev' | 'next';
  onClick: () => void;
  visible: boolean;
}) {
  if (!visible) return null;

  const isPrev = direction === 'prev';

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={onClick}
      className={cn(
        'absolute top-[110px] z-10 -translate-y-1/2 sm:top-[140px]',
        'size-[34px] rounded-full border border-zinc-200 bg-white',
        'shadow-[0px_8px_16px_0px_rgba(228,228,231,0.25)]',
        'hover:bg-zinc-50',
        isPrev ? '-left-[-20px]' : '-right-[-20px]',
      )}
    >
      {isPrev ? (
        <ChevronLeft className="size-[18px] text-zinc-500" />
      ) : (
        <ChevronRight className="size-[18px] text-zinc-500" />
      )}
    </Button>
  );
});

/**
 * Inner carousel content.
 */
const CarouselInner = memo(function CarouselInner({
  products,
}: {
  products: ProductWithCitation[];
}) {
  const { scrollNext, scrollPrev, emblaMainApi } = useCarousel();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const isMobile = useIsMobile();

  const onSelect = useCallback(() => {
    if (!emblaMainApi) return;
    setCanScrollPrev(emblaMainApi.canScrollPrev());
    setCanScrollNext(emblaMainApi.canScrollNext());
  }, [emblaMainApi]);

  useEffect(() => {
    if (!emblaMainApi) return;
    onSelect();
    emblaMainApi.on('select', onSelect);
    emblaMainApi.on('reInit', onSelect);
    return () => {
      emblaMainApi.off('select', onSelect);
      emblaMainApi.off('reInit', onSelect);
    };
  }, [emblaMainApi, onSelect]);

  // Mobile: 1 card visible, Desktop: 2 cards visible
  // Show arrows when there are more products than visible slots
  const showArrows = isMobile ? products.length >= 2 : products.length >= 3;

  // Slide width: mobile = 100%, desktop = 50% - 8px (half of 16px gap)
  const slideStyle = {
    flex: isMobile ? '0 0 100%' : '0 0 calc(50% - 8px)',
  };

  return (
    <div
      className="relative w-full min-w-0 max-w-full"
      role="region"
      aria-label="Product recommendations"
    >
      <NavArrow
        direction="prev"
        onClick={scrollPrev}
        visible={showArrows && canScrollPrev}
      />
      <div className="w-full min-w-0 max-w-full">
        <CarouselMainContainer className="gap-4">
          {products.map(({ product, citation }) => (
            <SliderMainItem
              key={citation.number}
              className="min-w-0 p-0"
              style={slideStyle}
            >
              <ProductCard product={product} />
            </SliderMainItem>
          ))}
        </CarouselMainContainer>
      </div>
      <NavArrow
        direction="next"
        onClick={scrollNext}
        visible={showArrows && canScrollNext}
      />
    </div>
  );
});

/**
 * Product carousel - displays 1 card on mobile, 2 on desktop.
 */
export const ProductCarousel = memo(function ProductCarousel(
  props: ProductCarouselProps,
) {
  const { products } = props;
  const isMobile = useIsMobile();

  return (
    <div className="w-full min-w-0 max-w-full overflow-hidden">
      <Carousel
        carouselOptions={{
          align: 'start',
          containScroll: false,
          slidesToScroll: isMobile ? 1 : 2,
        }}
        className="w-full min-w-0 max-w-full"
      >
        <CarouselInner products={products} />
      </Carousel>
    </div>
  );
});
