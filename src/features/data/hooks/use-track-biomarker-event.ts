import { useCallback } from 'react';

import { useAnalytics } from '@/hooks/use-analytics';

import type { DataBiomarker, DataSummaryCategory } from '../types/data-api';

type BiomarkerEventName = 'viewed_biomarker' | 'clicked_biomarker_product_cta';

export const useTrackBiomarkerEvent = ({
  biomarker,
  currentCategory,
}: {
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
      const product = diagnosticTest?.products[0];

      if (!biomarker) return;

      track(event, {
        biomarker_id: biomarker?.id,
        biomarker_slug: biomarker?.slug,
        biomarker_name: biomarker?.name,
        has_results: values.length > 0,
        result_count: values.length,
        latest_result_at: latestResultAt,
        biomarker_interpretation: obs?.status,
        biomarker: biomarker && {
          id: biomarker.id,
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
          slug: diagnosticTest.slug,
          name: diagnosticTest.name,
          gender: diagnosticTest.gender,
          vendor: diagnosticTest.vendor,
          jurisdictions: diagnosticTest.jurisdictions,
        },
        product: product && {
          id: product.id,
          slug: product.slug,
          name: product.name,
          title: product.title,
          status: product.status,
        },
        categories: biomarker?.categories?.map((c) => ({
          id: c.id,
          slug: c.slug,
          name: c.name,
          title: c.title,
        })),
        current_category: currentCategory && {
          id: currentCategory.id,
          slug: currentCategory.slug,
          name: currentCategory.name,
          title: currentCategory.title,
          subtitle: currentCategory.subtitle,
          score_value: currentCategory.healthScore.value,
        },
      });
    },
    [track, biomarker, currentCategory],
  );
};
