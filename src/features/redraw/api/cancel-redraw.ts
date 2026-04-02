import { $api } from '@/orpc/client';
import type { operations } from '@/orpc/types.generated';

type CancelRedrawResponse =
  operations['redraw.cancelRedraw']['responses'][200]['content']['application/json'];

export function useCancelRedraw() {
  const mutation = $api.useMutation(
    'post',
    '/redraw/{serviceRequestId}/cancel',
  );

  return {
    ...mutation,
    mutateAsync: async (
      serviceRequestId: string,
    ): Promise<CancelRedrawResponse> => {
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
