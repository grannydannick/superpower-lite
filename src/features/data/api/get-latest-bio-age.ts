import { queryOptions } from '@tanstack/react-query';

import type { DataBiomarker } from '../types/data-api';
import { getLatestObservationValue } from '../utils/get-latest-observation-value';

import { dataBiomarkersQueryOptions } from './get-data-biomarkers';

const BIOLOGICAL_AGE_SLUG = 'biological-age';

const selectLatestBioAge = (data: {
  biomarkers: { slug: string; observation?: unknown }[];
}) => {
  const biomarkers = data.biomarkers as DataBiomarker[];
  const observation = biomarkers.find(
    (b) => b.slug === BIOLOGICAL_AGE_SLUG,
  )?.observation;
  return { bioAge: getLatestObservationValue(observation) ?? null };
};

export const getLatestBioAgeQueryOptions = () =>
  queryOptions({
    ...dataBiomarkersQueryOptions(),
    select: selectLatestBioAge,
  });
