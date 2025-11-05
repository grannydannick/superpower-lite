import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

export type Recommendation = {
  id: string;
  name: string;
  description: string;
  tags: string[];
  quality: number;
  searchTerm: string;
  matchedString: string;
  reason: string;
  createdAt?: Date;
  questionnaireResponseId?: string;
};

export const getRecommendations = (): Promise<Recommendation[]> => {
  return api.get(`/recommendations`);
};

export const getRecommendationsQueryOptions = () => {
  return queryOptions({
    queryKey: ['recommendations'],
    queryFn: () => getRecommendations(),
  });
};

export const useRecommendations = () => {
  return useQuery({
    ...getRecommendationsQueryOptions(),
  });
};
