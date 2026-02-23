import { useQuery } from '@tanstack/react-query';
import * as z from 'zod';

import { api } from '@/lib/api-client';

export const createFollowupsInputSchema = z.object({
  context: z.string().min(1, 'Context must be non-empty.'),
  count: z.number().min(1).max(10).default(3),
});

export type CreateFollowupsInput = z.infer<typeof createFollowupsInputSchema>;

export const createFollowups = async ({
  data,
  signal,
}: {
  data: CreateFollowupsInput;
  signal?: AbortSignal;
}): Promise<string[]> => {
  return await api.post(
    `/chat/followup`,
    {
      context: data.context,
      count: data.count,
    },
    { signal },
  );
};

export const useCreateFollowups = ({
  context,
  count = 3,
  enabled = true,
}: {
  context: string;
  count?: number;
  enabled?: boolean;
}) => {
  const queryKey = ['followups', context, count] as const;
  return useQuery<string[], unknown, string[]>({
    queryKey,
    queryFn: ({ signal }) =>
      createFollowups({ data: { context, count }, signal }),
    enabled,
    staleTime: 1000 * 60 * 5,
  });
};
