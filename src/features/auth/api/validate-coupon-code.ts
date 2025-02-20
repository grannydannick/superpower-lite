import { queryOptions, useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { Coupon } from '@/types/api';

export const validateCode = ({
  accessCode,
}: ValidateInput): Promise<{ coupon: Coupon }> => {
  return api.get(`auth/coupon?code=${accessCode}`);
};

export const validateInputSchema = z.object({
  accessCode: z.string().min(1),
});

export type ValidateInput = z.infer<typeof validateInputSchema>;

export const validateCodeQueryOptions = (accessCode: string) => {
  return queryOptions({
    queryKey: ['accessCode', accessCode],
    queryFn: () => validateCode({ accessCode }),
  });
};

type UseValidateCodeOptions = {
  accessCode: string;
  queryConfig?: QueryConfig<typeof validateCodeQueryOptions>;
};

export const useValidateCode = ({
  accessCode,
  queryConfig,
}: UseValidateCodeOptions) => {
  return useQuery({
    ...validateCodeQueryOptions(accessCode),
    ...queryConfig,
  });
};
