import type { ReactNode } from 'react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
import type { AdvancedUpgradeBundleId } from '@/const';
import type { OnboardingProduct } from '@/features/onboarding/api/onboarding-products';

import { ProductBiomarkerRows } from './bundle-picker-biomarkers';
import {
  buildIncludedSections,
  type BundleGenderCopyInput,
  getBundleProductImageSrc,
  type IncludedSection,
} from './bundle-picker-products';

interface IncludedAccordionProps {
  bundleId: AdvancedUpgradeBundleId;
  productBySlug: Map<string, OnboardingProduct>;
  isLoading: boolean;
  isError: boolean;
  gender: BundleGenderCopyInput['gender'];
}

function ProductDetailHeader({ section }: { section: IncludedSection }) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-3 text-left">
      <div className="relative size-11 shrink-0 overflow-hidden">
        <img
          alt=""
          src={getBundleProductImageSrc(section.product)}
          className="size-full object-contain"
        />
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <p className="truncate text-xs leading-4 tracking-wide text-zinc-400">
          {section.eyebrow}
        </p>
        <p className="truncate text-sm leading-5 text-zinc-900">
          {section.title}
        </p>
      </div>
    </div>
  );
}

function IncludedAccordionBody({ section }: { section: IncludedSection }) {
  const rows = <ProductBiomarkerRows product={section.product} />;

  if (section.summaryLine.length === 0) {
    return rows;
  }

  return (
    <div className="min-w-0">
      <p className="min-w-0 break-words px-6 py-5 text-sm leading-5 text-zinc-500 md:px-0">
        {section.summaryLine}
      </p>
      <div
        data-testid="included-section-divider"
        className="mx-6 h-px bg-zinc-200 md:mx-0"
      />
      {rows}
    </div>
  );
}

export function IncludedAccordion({
  bundleId,
  productBySlug,
  isLoading,
  isError,
  gender,
}: IncludedAccordionProps) {
  if (isLoading) {
    return (
      <div className="space-y-2 rounded-xl bg-zinc-100/90 p-3">
        <Skeleton className="h-14 w-full rounded-lg" />
        <Skeleton className="h-14 w-full rounded-lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <p className="rounded-xl bg-zinc-100/90 px-3 py-4 text-sm leading-relaxed text-zinc-500">
        Unable to load included tests right now. You can still continue.
      </p>
    );
  }

  const sections = buildIncludedSections(bundleId, productBySlug, { gender });

  const items: ReactNode[] = [];

  for (const section of sections) {
    items.push(
      <AccordionItem
        key={section.accordionValue}
        data-testid={`included-section-${section.accordionValue}`}
        value={section.accordionValue}
        className="min-w-0 overflow-hidden rounded-2xl border border-zinc-200 bg-white md:border-0 md:bg-transparent"
      >
        <AccordionTrigger className="min-w-0 rounded-2xl p-4 hover:no-underline md:px-0 md:py-3">
          <ProductDetailHeader section={section} />
        </AccordionTrigger>
        <AccordionContent className="min-w-0 p-0">
          <IncludedAccordionBody section={section} />
        </AccordionContent>
      </AccordionItem>,
    );
  }

  if (items.length === 0) {
    return (
      <p className="rounded-xl bg-zinc-100/90 px-3 py-4 text-sm leading-relaxed text-zinc-500">
        Included test details are not available yet.
      </p>
    );
  }

  return (
    <Accordion type="multiple" className="min-w-0 space-y-3">
      {items}
    </Accordion>
  );
}
