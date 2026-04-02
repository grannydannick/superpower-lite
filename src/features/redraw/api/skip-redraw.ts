import { $api } from '@/orpc/client';
import type { operations } from '@/orpc/types.generated';

type SkipRedrawResponse =
  operations['redraw.skipRedraw']['responses'][200]['content']['application/json'];

export function useSkipRedraw() {
  const mutation = $api.useMutation('post', '/redraw/{serviceRequestId}/skip');

  return {
    ...mutation,
    mutateAsync: async (
      serviceRequestId: string,
    ): Promise<SkipRedrawResponse> => {
      return mutation.mutateAsync({
        params: {
          path: {
            serviceRequestId,
          },
        },
      });
    },
  };
}
