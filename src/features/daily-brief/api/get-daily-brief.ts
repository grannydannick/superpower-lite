import { queryOptions, useQuery } from '@tanstack/react-query';

import { aiChatApi } from '@/orpc/ai-chat-api';

interface DailyBrief {
  brief: string;
  phase: 'pre-results' | 'post-results' | 'mid-protocol';
  layers: string[];
  actionUrl: string | null;
  generatedAt: string;
}

async function fetchDailyBrief(): Promise<DailyBrief> {
  const { data, error } = await aiChatApi.GET('/daily-brief/' as any, {});
  if (error != null) {
    throw new Error('Failed to fetch daily brief');
  }
  return data as DailyBrief;
}

export function getDailyBriefQueryOptions() {
  return queryOptions({
    queryKey: ['daily-brief'],
    queryFn: fetchDailyBrief,
    staleTime: Infinity,
    retry: 1,
  });
}

export function useDailyBrief() {
  return useQuery(getDailyBriefQueryOptions());
}
