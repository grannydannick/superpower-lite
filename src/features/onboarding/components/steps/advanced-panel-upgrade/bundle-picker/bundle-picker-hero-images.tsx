import type { ReactNode } from 'react';

import {
  ADVANCED_UPGRADE_BUNDLE_IDS,
  type AdvancedUpgradeBundleId,
} from '@/const';
import type { OnboardingProduct } from '@/features/onboarding/api/onboarding-products';
import { cn } from '@/lib/utils';

import { ADVANCED_PANEL_IMAGE } from './bundle-picker-assets';
import {
  buildIncludedSections,
  getBundleProductImageSrc,
} from './bundle-picker-products';

interface BundleHeroImagesProps {
  bundleId: AdvancedUpgradeBundleId;
  productBySlug: Map<string, OnboardingProduct>;
  size?: 'mobile' | 'desktop';
}

export function BundleHeroImages({
  bundleId,
  productBySlug,
  size = 'mobile',
}: BundleHeroImagesProps) {
  const sections = buildIncludedSections(bundleId, productBySlug);
  const productImages: string[] = [ADVANCED_PANEL_IMAGE];

  if (bundleId !== ADVANCED_UPGRADE_BUNDLE_IDS.ADVANCED_UPGRADE) {
    for (const section of sections) {
      if (section.kind !== 'service') {
        continue;
      }

      if (section.slug === 'gut-microbiome-analysis') {
        productImages.push(getBundleProductImageSrc(section.product));
        break;
      }
    }
  }

  if (bundleId === ADVANCED_UPGRADE_BUNDLE_IDS.COMPLETE_BUNDLE) {
    for (const section of sections) {
      if (section.kind !== 'service') {
        continue;
      }

      if (section.slug === 'gut-microbiome-analysis') {
        continue;
      }

      if (
        section.slug === 'heavy-metals' ||
        section.slug === 'mycotoxins' ||
        section.slug === 'environmental-toxins'
      ) {
        productImages.push(getBundleProductImageSrc(section.product));
      }
    }
  }

  if (size === 'mobile') {
    if (productImages.length === 0) {
      return null;
    }

    const imgs: ReactNode[] = [];
    let idx = 0;
    for (const src of productImages) {
      const isAdvancedVial = src === ADVANCED_PANEL_IMAGE;
      imgs.push(
        <img
          key={`${src}-${idx}`}
          alt=""
          src={src}
          data-testid="bundle-hero-product-image"
          className={cn(
            'w-auto shrink-0 object-contain',
            isAdvancedVial
              ? 'h-11 max-h-11 max-w-[min(18vw,4.25rem)]'
              : 'h-14 max-h-14 max-w-[min(22vw,5.5rem)]',
          )}
        />,
      );
      idx += 1;
    }

    return (
      <div
        data-testid="bundle-hero-images"
        className="flex h-14 w-full max-w-full flex-nowrap items-center justify-start gap-2 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {imgs}
      </div>
    );
  }

  if (productImages.length === 1) {
    const image = productImages[0];
    if (image == null) {
      return null;
    }

    return (
      <div
        data-testid="bundle-hero-images"
        className="relative h-28 w-full overflow-hidden"
      >
        <img
          alt=""
          src={image}
          data-testid="bundle-hero-product-image"
          className="absolute left-1/2 top-1/2 h-20 w-auto -translate-x-1/2 -translate-y-1/2 object-contain"
        />
      </div>
    );
  }

  let slots: string[];
  if (productImages.length === 2) {
    slots = ['left-[16%] top-6 h-14 w-24', 'left-[56%] top-5 h-16 w-20'];
  } else if (productImages.length === 5) {
    slots = [
      'left-[2%] top-4 h-12 w-24',
      'left-[34%] top-2 h-14 w-20',
      'left-[66%] top-3 h-14 w-20',
      'left-[22%] top-14 h-14 w-20',
      'left-[54%] top-14 h-14 w-20',
    ];
  } else {
    slots = [
      'left-[4%] top-4 h-16 w-20',
      'left-[34%] top-3 h-16 w-20',
      'left-[66%] top-4 h-16 w-20',
    ];
  }

  const images: ReactNode[] = [];
  let slot = 0;
  for (const image of productImages) {
    const className = slots[slot];
    if (className == null) {
      break;
    }

    images.push(
      <img
        key={`${image}-${slot}`}
        alt=""
        src={image}
        data-testid="bundle-hero-product-image"
        className={cn('absolute object-contain', className)}
      />,
    );
    slot += 1;
  }

  return (
    <div
      data-testid="bundle-hero-images"
      className="relative h-28 w-full overflow-hidden"
    >
      {images}
    </div>
  );
}
