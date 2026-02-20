import { HelpCircle } from 'lucide-react';
import { memo } from 'react';

import { Button } from '@/components/ui/button';
import { ProgressiveImage } from '@/components/ui/progressive-image';
import { getPricingDetails } from '@/features/supplements/utils/get-pricing-details';
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

interface ProductCitationCardProps {
  messageId: string;
  citation: CitationInfo;
  product: Product | Rx | HealthcareService;
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
 * Compact product card for marketplace citations.
 * Shows product image, name, price with discount, and "Learn more" button.
 */
export const ProductCitationCard = memo(function ProductCitationCard({
  messageId,
  citation,
  product,
}: ProductCitationCardProps) {
  const cardId = `${messageId}-citation-${citation.number}`;

  // Services have prices in cents, supplements/rx in dollars
  const isService = isHealthcareService(product);

  // Get pricing details (only for products with discount)
  const pricingDetails = isProduct(product)
    ? getPricingDetails(product)
    : {
        hasDiscount: false,
        discountedPrice: isService ? product.price / 100 : (product.price ?? 0),
      };

  const { hasDiscount, discountedPrice } = pricingDetails;
  const originalPrice = isProduct(product)
    ? product.price
    : isService
      ? product.price / 100
      : (product.price ?? 0);

  // Build the product URL
  const productUrl = getProductUrl(product);

  // Get product image
  const productImage = getProductImage(product);

  return (
    <a
      id={cardId}
      href={productUrl}
      target="_blank"
      rel="noreferrer"
      aria-label={`Citation ${citation.number}: ${product.name}`}
      className={cn(
        'flex h-[76px] scroll-mt-4 items-center justify-between overflow-clip',
        'rounded-[20px] border border-zinc-200 bg-white pl-2 pr-4',
        'shadow-[0px_2px_2px_0px_rgba(0,0,0,0.02)]',
        'cursor-pointer transition-all hover:border-zinc-300',
      )}
    >
      {/* Left side: Image + Info */}
      <div className="flex items-center gap-2 py-2">
        {/* Product Image */}
        <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-white">
          <ProgressiveImage
            src={productImage}
            alt={product.name}
            className="h-12 w-auto max-w-[40px] object-contain"
          />
        </div>

        {/* Product Info */}
        <div className="flex flex-col items-start justify-center">
          <div className="flex items-center gap-2">
            <span className="line-clamp-1 text-sm leading-5 text-zinc-900">
              {product.name}
            </span>
            <HelpCircle className="size-4 shrink-0 text-zinc-400" />
          </div>
          <div className="flex items-center gap-2 text-sm">
            {hasDiscount ? (
              <>
                <span className="text-zinc-400 line-through">
                  ${originalPrice}
                </span>
                <span className="text-zinc-900">
                  ${discountedPrice.toFixed(0)}
                </span>
              </>
            ) : (
              <span className="text-zinc-900">
                ${typeof originalPrice === 'number' ? originalPrice : '—'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right side: Learn more button */}
      <Button
        variant="outline"
        size="small"
        className="shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        Learn more
      </Button>
    </a>
  );
});
