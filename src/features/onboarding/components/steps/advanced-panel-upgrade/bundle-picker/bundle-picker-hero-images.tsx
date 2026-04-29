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

  if (productImages.length === 1) {
    const image = productImages[0];
    if (image == null) {
      return null;
    }

    return (
      <div
        data-testid="bundle-hero-images"
        className={cn(
          'relative overflow-hidden',
          size === 'desktop' ? 'h-28 w-full' : 'h-20 w-[176px]',
        )}
      >
        <img
          alt=""
          src={image}
          data-testid="bundle-hero-product-image"
          className={cn(
            'absolute top-1/2 h-20 w-auto -translate-y-1/2 object-contain',
            size === 'desktop' ? 'left-1/2 -translate-x-1/2' : 'left-0',
          )}
        />
      </div>
    );
  }

  const slots =
    size === 'desktop'
      ? productImages.length === 2
        ? ['left-[16%] top-6 h-14 w-24', 'left-[56%] top-5 h-16 w-20']
        : productImages.length === 5
          ? [
              'left-[2%] top-4 h-12 w-24',
              'left-[34%] top-2 h-14 w-20',
              'left-[66%] top-3 h-14 w-20',
              'left-[22%] top-14 h-14 w-20',
              'left-[54%] top-14 h-14 w-20',
            ]
          : [
              'left-[4%] top-4 h-16 w-20',
              'left-[34%] top-3 h-16 w-20',
              'left-[66%] top-4 h-16 w-20',
            ]
      : productImages.length === 2
        ? ['left-5 top-4 h-12 w-20', 'left-[91px] top-3 h-14 w-16']
        : productImages.length === 5
          ? [
              'left-1 top-1 h-9 w-18',
              'left-[54px] top-1 h-11 w-14',
              'left-[111px] top-1 h-11 w-14',
              'left-7 top-9 h-11 w-14',
              'left-[91px] top-9 h-11 w-14',
            ]
          : [
              'left-2 top-3 h-14 w-16',
              'left-14 top-2 h-14 w-16',
              'left-[104px] top-3 h-14 w-16',
            ];

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
      className={cn(
        'relative overflow-hidden',
        size === 'desktop' ? 'h-28 w-full' : 'h-20 w-[176px]',
      )}
    >
      {images}
    </div>
  );
}
