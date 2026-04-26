import { useMemo } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import { Body2, Body3, H4 } from '@/components/ui/typography';
import { STATUS_TO_COLOR } from '@/const/status-to-color';
import { BiomarkerDialog } from '@/features/data/components/dialogs/biomarker-dialog';
import { mostRecent } from '@/features/data/utils/most-recent-biomarker';
import { useMarketplaceProductBiomarkers } from '@/features/marketplace/api/marketplace-products';
import { cn } from '@/lib/utils';
import type { Biomarker } from '@/types/api';
import { getDisplayComparator } from '@/utils/get-display-comparator';

import { useProduct } from '../../../contexts/product-context';

type ProductBiomarker = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  categories?: { id: string; slug: string; title: string }[];
  observation?: Biomarker;
};

function BiomarkerValueText({ obs }: { obs: Biomarker }) {
  const latest = mostRecent(obs.value);
  if (!latest) return null;

  if (obs.dataType === 'codedValue') {
    return latest.valueCoded ? (
      <Body2 className="capitalize text-zinc-500">{latest.valueCoded}</Body2>
    ) : null;
  }

  if (obs.dataType === 'text') return null;

  if (obs.dataType === 'range' && latest.valueRange) {
    const { low, high, unit } = latest.valueRange;
    return (
      <Body2 className="text-zinc-500">
        {low}–{high} <span className="text-zinc-400">{unit ?? obs.unit}</span>
      </Body2>
    );
  }

  if (latest.quantity) {
    const { value, comparator, unit } = latest.quantity;
    return (
      <Body2 className="text-zinc-500">
        {getDisplayComparator(comparator)}
        {value} <span className="text-zinc-400">{unit ?? obs.unit}</span>
      </Body2>
    );
  }

  return null;
}

function BiomarkerRow({ biomarker }: { biomarker: ProductBiomarker }) {
  const obs = biomarker.observation;

  if (!obs) {
    return (
      <BiomarkerDialog slug={biomarker.slug} hideBookNow showRetests>
        <button className="flex w-full items-center justify-between gap-3 rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3 text-left transition-colors hover:bg-zinc-100">
          <div className="min-w-0 flex-1">
            <Body2 className="truncate text-zinc-700">{biomarker.title}</Body2>
            {(biomarker.subtitle || biomarker.categories?.[0]?.title) && (
              <Body3 className="truncate text-zinc-400">
                {biomarker.subtitle || biomarker.categories![0].title}
              </Body3>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-zinc-100 px-2 py-1">
            <div className="size-1.5 shrink-0 rounded-full bg-zinc-400" />
            <Body2 className="text-zinc-400">Untested</Body2>
          </div>
        </button>
      </BiomarkerDialog>
    );
  }

  const statusKey = obs.status.toLowerCase() as keyof typeof STATUS_TO_COLOR;
  const statusColor = STATUS_TO_COLOR[statusKey] ?? STATUS_TO_COLOR.pending;
  const statusColorLight =
    STATUS_TO_COLOR[`${statusKey}_light` as keyof typeof STATUS_TO_COLOR] ??
    STATUS_TO_COLOR.pending_light;

  return (
    <BiomarkerDialog slug={biomarker.slug} hideBookNow showRetests>
      <button className="flex w-full items-center justify-between gap-3 rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3 text-left transition-colors hover:bg-zinc-100">
        <div className="min-w-0 flex-1">
          <Body2 className="truncate text-zinc-700">{biomarker.title}</Body2>
          {biomarker.subtitle && (
            <Body3 className="truncate text-zinc-400">
              {biomarker.subtitle}
            </Body3>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <BiomarkerValueText obs={obs} />
          <div
            style={{ backgroundColor: statusColorLight }}
            className="flex items-center gap-1.5 rounded-full px-2 py-1"
          >
            <div
              style={{ backgroundColor: statusColor }}
              className="size-1.5 shrink-0 rounded-full"
            />
            <Body2 style={{ color: statusColor }} className="capitalize">
              {obs.status.toLowerCase()}
            </Body2>
          </div>
        </div>
      </button>
    </BiomarkerDialog>
  );
}

const statusOrder: Record<string, number> = {
  HIGH: 0,
  LOW: 0,
  ABNORMAL: 0,
  NORMAL: 1,
  OPTIMAL: 2,
};

export function ProductBiomarkers({ className }: { className?: string }) {
  const { slug } = useProduct();
  const { data, isLoading } = useMarketplaceProductBiomarkers(slug);

  const biomarkers = useMemo(() => {
    const raw = data?.biomarkers as ProductBiomarker[] | undefined;
    if (!raw?.length) return null;
    return [...raw].sort((a, b) => {
      const aOrder = a.observation
        ? (statusOrder[a.observation.status] ?? 3)
        : 4;
      const bOrder = b.observation
        ? (statusOrder[b.observation.status] ?? 3)
        : 4;
      return aOrder - bOrder;
    });
  }, [data]);

  if (isLoading) {
    return (
      <>
        <div className="my-6 h-px w-full bg-zinc-200" />
        <div className={cn('flex flex-col gap-3', className)}>
          <Skeleton className="h-5 w-40 rounded-full" />
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      </>
    );
  }

  if (!biomarkers) return null;

  return (
    <>
      <div className="my-6 h-px w-full bg-zinc-200" />
      <div className={cn('flex flex-col gap-3', className)}>
        <H4>Biomarkers tested</H4>
        <div className="flex flex-col gap-2">
          {biomarkers.map((b) => (
            <BiomarkerRow key={b.id} biomarker={b} />
          ))}
        </div>
      </div>
    </>
  );
}
