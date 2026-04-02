import { useQueryClient } from '@tanstack/react-query';
import { createFileRoute, notFound, useNavigate } from '@tanstack/react-router';

import { toast } from '@/components/ui/sonner';
import { Spinner } from '@/components/ui/spinner';
import { getOrdersQueryOptions, useOrders } from '@/features/orders/api';
import {
  getRedrawsQueryOptions,
  useRedraws,
} from '@/features/redraw/api/get-redraws';
import { useScheduleRedraw } from '@/features/redraw/api/schedule-redraw';
import { RedrawScheduleFlow } from '@/features/redraw/components/redraw-schedule-flow';
import { getScheduledRedrawOrder } from '@/features/redraw/utils/get-scheduled-redraw-order';

function isSupportedRedrawCollectionMethod(
  value: string | undefined,
): value is 'AT_HOME' | 'IN_LAB' {
  return value === 'AT_HOME' || value === 'IN_LAB';
}

export const Route = createFileRoute(
  '/_app/_maps/recollection/$serviceRequestId/schedule',
)({
  component: RecollectionScheduleComponent,
});

function RecollectionScheduleComponent() {
  const { serviceRequestId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data, isError, isLoading } = useRedraws();
  const ordersQuery = useOrders();
  const scheduleRedrawMutation = useScheduleRedraw();

  const redrawFromApi = data?.redraws.find(
    (item) => item.serviceRequestId === serviceRequestId,
  );
  const scheduledRedrawRequestGroup = (
    ordersQuery.data?.requestGroups ?? []
  ).find(
    (requestGroup) =>
      getScheduledRedrawOrder(requestGroup)?.id === serviceRequestId,
  );
  const scheduledRedrawOrder = scheduledRedrawRequestGroup
    ? getScheduledRedrawOrder(scheduledRedrawRequestGroup)
    : undefined;
  const redraw =
    redrawFromApi ??
    (scheduledRedrawOrder
      ? {
          serviceRequestId: scheduledRedrawOrder.id,
          serviceRequestIds: [scheduledRedrawOrder.id],
          redrawStatus: scheduledRedrawOrder.redrawStatus ?? 'scheduled',
          serviceName: scheduledRedrawOrder.serviceName,
          serviceNames: [scheduledRedrawOrder.serviceName],
          missingBiomarkers: [],
          canSchedule: true,
          canSkip: false,
          canCancel: true,
          collectionMethod:
            scheduledRedrawRequestGroup?.collectionMethod ??
            scheduledRedrawOrder.collectionMethod,
        }
      : undefined);
  const supportedCollectionMethod = redraw?.collectionMethod;

  if (isLoading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner variant="primary" size="lg" />
      </div>
    );
  }

  if (
    isError ||
    ordersQuery.isError ||
    !redraw ||
    !isSupportedRedrawCollectionMethod(supportedCollectionMethod)
  ) {
    throw notFound();
  }

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <RedrawScheduleFlow
        redraw={{
          ...redraw,
          collectionMethod: supportedCollectionMethod,
        }}
        isPending={scheduleRedrawMutation.isPending}
        onBack={() => {
          if (scheduledRedrawRequestGroup) {
            void navigate({
              to: '/orders/$id',
              params: { id: scheduledRedrawRequestGroup.id },
            });
            return;
          }

          void navigate({
            to: '/recollection/$serviceRequestId',
            params: { serviceRequestId },
          });
        }}
        onConfirm={async (payload) => {
          await scheduleRedrawMutation.mutateAsync(serviceRequestId, payload);
          toast.success('Recollection scheduled!');
          await navigate({
            to: scheduledRedrawRequestGroup ? '/orders' : '/',
            replace: true,
          });
          void queryClient.invalidateQueries({
            queryKey: getOrdersQueryOptions().queryKey,
          });
          void queryClient.invalidateQueries({
            queryKey: getRedrawsQueryOptions().queryKey,
          });
        }}
      />
    </div>
  );
}
