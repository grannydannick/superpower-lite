import { api } from '@/lib/api-client';
import { Chat } from '@/types/api';

export type HistoryCursor = { id: string };

export const getHistoryPage = async ({
  cursor,
  limit,
}: {
  cursor?: HistoryCursor;
  limit?: number;
}): Promise<Chat[]> => {
  return api.get('/chat/history', {
    params: {
      ...(limit ? { limit } : {}),
      ...(cursor ? { cursor } : {}),
    },
  });
};
