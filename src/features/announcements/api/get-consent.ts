import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { Consent, ConsentType } from '@/types/api';

export interface GetConsentInput {
  userId: string;
  type?: ConsentType;
}

export const getConsent = ({
  userId,
  type,
}: {
  userId: string;
  type?: ConsentType;
}): Promise<Consent> => {
  const params = new URLSearchParams({ userId });
  if (type) {
    params.append('type', type);
  }
  return api.get(`/consent?${params.toString()}`);
};

export const getConsentQueryOptions = (userId: string, type?: ConsentType) => {
  return queryOptions({
    queryKey: ['consent', userId, type],
    queryFn: () => getConsent({ userId, type }),
    enabled: userId.length > 0,
  });
};

type UseGetConsentOptions = {
  userId: string;
  type?: ConsentType;
  queryConfig?: QueryConfig<typeof getConsentQueryOptions>;
};

export const useGetConsent = ({
  userId,
  type,
  queryConfig,
}: UseGetConsentOptions) => {
  return useQuery({
    ...getConsentQueryOptions(userId, type),
    ...queryConfig,
  });
};
