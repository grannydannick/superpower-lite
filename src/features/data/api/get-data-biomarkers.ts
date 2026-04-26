import { queryOptions, useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

import { api } from '@/orpc/client';
import type { operations } from '@/orpc/types.generated';

import type { DataBiomarker } from '../types/data-api';
import { evaluateMdx, type MdxModule } from '../utils/evaluate-mdx';

export const SuperpowerCategorySlug = {
  HEART_AND_VASCULAR: 'heart-vascular-health',
  LIVER: 'liver-health',
  KIDNEY: 'kidney-health',
  METABOLIC: 'metabolic-health',
  INFLAMMATION: 'inflammation',
  NUTRIENTS: 'nutrients',
  ENERGY: 'energy',
  IMMUNE_SYSTEM: 'immune-system',
  DNA_HEALTH: 'dna-health',
  BRAIN_HEALTH: 'brain-health',
  THYROID_HEALTH: 'thyroid-health',
  SEX_HORMONES: 'sex-hormones',
  GUT_HEALTH: 'gut-health',
  TOXIN_EXPOSURE: 'toxin-exposure',
} as const;

export type SuperpowerCategorySlug =
  (typeof SuperpowerCategorySlug)[keyof typeof SuperpowerCategorySlug];

const matchesCategorySlug = (
  categories: DataBiomarker['categories'],
  slug: string,
) => categories.some((c) => c.slug === slug);

const fetchDataBiomarkers = async () => {
  const { data, error } = await api.GET('/data/biomarkers', {
    params: { query: {} },
  });
  if (error) throw error;
  return data;
};

export const dataBiomarkersQueryOptions = () =>
  queryOptions({
    queryKey: ['data', 'biomarkers'],
    queryFn: fetchDataBiomarkers,
  });

export const dataBiomarkerQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: ['data', 'biomarkers'],
    queryFn: fetchDataBiomarkers,
    select: (data) =>
      (data.biomarkers as DataBiomarker[]).find((b) => b.slug === slug) ?? null,
  });

export const useDataBiomarkers = ({
  categorySlug,
}: { categorySlug?: string } = {}) => {
  const select = useCallback(
    (data: Awaited<ReturnType<typeof fetchDataBiomarkers>>) => ({
      biomarkers: (data.biomarkers as DataBiomarker[]).filter((b) =>
        categorySlug != null
          ? matchesCategorySlug(b.categories, categorySlug)
          : true,
      ),
    }),
    [categorySlug],
  );

  return useQuery({ ...dataBiomarkersQueryOptions(), select });
};

export const useDataBiomarker = (
  slug: string,
  options?: { enabled?: boolean },
) => useQuery({ ...dataBiomarkerQueryOptions(slug), ...options });

type RawBiomarkerContent =
  operations['data.biomarkerContent']['responses'][200]['content']['application/json'];

export type BiomarkerContent = RawBiomarkerContent & {
  ContentComponent: MdxModule['default'] | null;
};

export const dataBiomarkerContentQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: ['data', 'biomarkers', slug, 'content'],
    queryFn: async (): Promise<BiomarkerContent | null> => {
      const { data, error } = await api.GET('/data/biomarkers/{slug}/content', {
        params: { path: { slug } },
      });
      if (error) throw error;
      if (!data) return null;
      let ContentComponent: MdxModule['default'] | null = null;
      if (data.content) {
        try {
          ContentComponent = (await evaluateMdx(data.content)).default;
        } catch (err) {
          console.error('Failed to parse biomarker MDX', { slug, err });
        }
      }
      return { ...data, ContentComponent };
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });

export const useDataBiomarkerContent = (
  slug: string,
  options?: { enabled?: boolean },
) => useQuery({ ...dataBiomarkerContentQueryOptions(slug), ...options });
