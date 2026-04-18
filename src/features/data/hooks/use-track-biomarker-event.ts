import { useCallback } from 'react';

import { useAnalytics } from '@/hooks/use-analytics';

import type { DataBiomarker, DataSummaryCategory } from '../types/data-api';

type BiomarkerEventName = 'viewed_biomarker' | 'clicked_biomarker_product_cta';

export const useTrackBiomarkerEvent = ({
  id,
  biomarker,
  currentCategory,
}: {
  id: string;
  biomarker?: DataBiomarker | null;
  currentCategory?: DataSummaryCategory;
}) => {
  const { track } = useAnalytics();

  return useCallback(
    (event: BiomarkerEventName) => {
      const obs = biomarker?.observation;
      const values = obs?.value ?? [];
      const latestResultAt = values.reduce<string | null>((latest, v) => {
        if (!latest) return v.timestamp;
        return new Date(v.timestamp).getTime() > new Date(latest).getTime()
          ? v.timestamp
          : latest;
      }, null);
      const diagnosticTest = biomarker?.diagnosticTests[0];
      const product = diagnosticTest?.product;

      track(event, {
        biomarker_id: biomarker?.id ?? id,
        has_results: values.length > 0,
        result_count: values.length,
        latest_result_at: latestResultAt,
        biomarker_interpretation: obs?.status,
        biomarker: biomarker && {
          id: biomarker.id,
          version: biomarker.version,
          slug: biomarker.slug,
          name: biomarker.name,
          title: biomarker.title,
          subtitle: biomarker.subtitle,
          gender: biomarker.gender,
          hidden: biomarker.hidden,
          tags: biomarker.tags,
        },
        diagnostic_test: diagnosticTest && {
          id: diagnosticTest.id,
          version: diagnosticTest.version,
          slug: diagnosticTest.slug,
          name: diagnosticTest.name,
          gender: diagnosticTest.gender,
          vendor: diagnosticTest.vendor,
          jurisdictions: diagnosticTest.jurisdictions,
        },
        product: product && {
          id: product.id,
          version: product.version,
          slug: product.slug,
          name: product.name,
          title: product.title,
          status: product.status,
        },
        categories: biomarker?.categories?.map((c) => ({
          id: c.id,
          version: c.version,
          slug: c.slug,
          name: c.name,
          title: c.title,
        })),
        current_category: currentCategory && {
          id: currentCategory.id,
          version: currentCategory.version,
          slug: currentCategory.slug,
          name: currentCategory.name,
          title: currentCategory.title,
          subtitle: currentCategory.subtitle,
          score_value: currentCategory.score?.value,
          score_category: currentCategory.score?.category,
        },
      });
    },
    [track, id, biomarker, currentCategory],
  );
};
