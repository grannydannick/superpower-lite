import { queryOptions, useQuery } from '@tanstack/react-query';
import { $aiChatApi } from '@/orpc/ai-chat-api';

interface DailyBrief {
  brief: string;
  phase: 'pre-results' | 'post-results' | 'mid-protocol';
  layers: string[];
  actionUrl: string | null;
  generatedAt: string;
}

export function getDailyBriefQueryOptions() {
  return queryOptions({
    queryKey: ['daily-brief'],
    queryFn: async (): Promise<DailyBrief> => {
      const { data, error } = await $aiChatApi.GET('/api/v1/daily-brief');
      if (error != null) {
        throw new Error('Failed to fetch daily brief');
      }
      return data as DailyBrief;
    },
    staleTime: Infinity,
    retry: 1,
  });
}

export function useDailyBrief() {
  return useQuery(getDailyBriefQueryOptions());
}
