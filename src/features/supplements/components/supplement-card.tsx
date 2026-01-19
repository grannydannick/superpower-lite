import { useInView } from 'react-intersection-observer';

import { Button } from '@/components/ui/button';
import { ProgressiveImage } from '@/components/ui/progressive-image';
import { Body1, Body2, Body3, H4 } from '@/components/ui/typography';
import { env } from '@/config/env';
import { getPricingDetails } from '@/features/supplements/utils/get-pricing-details';
import { Product } from '@/types/api';

type SupplementCardProps = {
  product: Product;
};

const FALLBACK_SUPPLEMENT_IMAGE = '/marketplaces/supplements-empty-state.webp';

export const SupplementCard = ({ product }: SupplementCardProps) => {
  const { ref, inView } = useInView({
    rootMargin: '200px',
    triggerOnce: true,
  });

  return (
    <div ref={ref}>
      <DesktopCard product={product} showImage={inView} />
      <MobileCard product={product} showImage={inView} />
    </div>
  );
};

const DesktopCard = ({
  product,
  showImage,
}: {
  product: Product;
  showImage: boolean;
}) => {
  const { hasDiscount, discountedPrice } = getPricingDetails(product);

  const url = product.url.startsWith('/marketplace')
    ? `${env.MARKETING_SITE_URL}${product.url}`
    : product.url;

  return (
    <a
      className="group relative hidden cursor-pointer flex-col gap-4 overflow-hidden sm:flex"
      href={url}
      target="_blank"
      rel="noreferrer"
    >
      <div className="relative flex aspect-square items-center justify-center rounded-[20px] bg-zinc-50">
        {product.image && showImage ? (
          <ProgressiveImage
            src={product.image}
            alt={product.name}
            className="h-[240px] w-full rounded-[20px] bg-zinc-50 object-contain"
          />
        ) : (
          <img
            src={FALLBACK_SUPPLEMENT_IMAGE}
            alt={product.name}
            className="h-[240px] w-full rounded-[20px] bg-zinc-50 object-contain"
          />
        )}
        <div className="pointer-events-none absolute inset-x-4 bottom-4 translate-y-2 opacity-0 blur-sm transition-all duration-200 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-hover:blur-0">
          <Button className="mx-auto flex w-full" size="medium">
            View Product
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <H4>{product.name}</H4>
          <div className="flex items-center gap-2">
            {hasDiscount ? (
              <>
                <Body1 className="text-secondary line-through">
                  ${product.price}
                </Body1>
                <H4>${discountedPrice.toFixed(2)}</H4>
              </>
            ) : (
              <H4>${product.price}</H4>
            )}
          </div>
        </div>
        <div className="flex justify-between">
          <Body1 className="text-secondary">{product.vendor}</Body1>

          {hasDiscount && (
            <Body1 className="text-vermillion-900">-{product.discount}%</Body1>
          )}
        </div>
      </div>
    </a>
  );
};

const MobileCard = ({
  product,
  showImage,
}: {
  product: Product;
  showImage: boolean;
}) => {
  const { hasDiscount, discountedPrice } = getPricingDetails(product);

  const url = product.url.startsWith('/marketplace')
    ? `${env.MARKETING_SITE_URL}${product.url}`
    : product.url;

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="flex flex-col gap-2 sm:hidden"
    >
      <div className="flex aspect-square items-center justify-center rounded-[20px] bg-zinc-50">
        {product.image && showImage ? (
          <ProgressiveImage
            src={product.image}
            alt={product.name}
            className="aspect-square w-full rounded-[20px] bg-zinc-50 object-contain"
          />
        ) : (
          <img
            src={FALLBACK_SUPPLEMENT_IMAGE}
            alt={product.name}
            className="aspect-square w-full rounded-[20px] bg-zinc-50 object-contain"
          />
        )}
      </div>
      <div className="flex flex-col gap-1">
        <Body3 className="text-secondary">{product.vendor}</Body3>
        <Body2 className="truncate">{product.name}</Body2>
        <div className="flex items-center gap-2">
          {hasDiscount ? (
            <>
              <Body2>${discountedPrice.toFixed(2)}</Body2>
              <Body3 className="text-secondary line-through">
                ${product.price}
              </Body3>
            </>
          ) : (
            <Body2>${product.price}</Body2>
          )}
        </div>
      </div>
    </a>
  );
};
