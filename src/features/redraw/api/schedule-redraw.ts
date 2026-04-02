import { $api } from '@/orpc/client';
import type { operations } from '@/orpc/types.generated';

type ScheduleRedrawInput =
  operations['redraw.scheduleRedraw']['requestBody']['content']['application/json'];
type ScheduleRedrawResponse =
  operations['redraw.scheduleRedraw']['responses'][200]['content']['application/json'];

export function useScheduleRedraw() {
  const mutation = $api.useMutation(
    'post',
    '/redraw/{serviceRequestId}/schedule',
  );

  return {
    ...mutation,
    mutateAsync: async (
      serviceRequestId: string,
      body: ScheduleRedrawInput,
    ): Promise<ScheduleRedrawResponse> => {
      return mutation.mutateAsync({
        params: {
          path: {
            serviceRequestId,
          },
        },
        body,
      });
    },
  };
}
