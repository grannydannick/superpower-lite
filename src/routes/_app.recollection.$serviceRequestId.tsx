import { useQueryClient } from '@tanstack/react-query';
import { createFileRoute, notFound } from '@tanstack/react-router';
import { useNavigate } from '@tanstack/react-router';

import { toast } from '@/components/ui/sonner';
import { Spinner } from '@/components/ui/spinner';
import {
  getRedrawsQueryOptions,
  useRedraws,
} from '@/features/redraw/api/get-redraws';
import { useSkipRedraw } from '@/features/redraw/api/skip-redraw';
import { RedrawOverviewPage } from '@/features/redraw/components/redraw-overview-page';

export const Route = createFileRoute('/_app/recollection/$serviceRequestId')({
  component: RecollectionComponent,
});

function RecollectionComponent() {
  const { serviceRequestId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data, isError, isLoading } = useRedraws();
  const skipRedrawMutation = useSkipRedraw();

  const redraw = data?.redraws.find(
    (item) => item.serviceRequestId === serviceRequestId,
  );

  if (isLoading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner variant="primary" size="lg" />
      </div>
    );
  }

  if (isError || !redraw) {
    throw notFound();
  }

  return (
    <RedrawOverviewPage
      redraw={redraw}
      isSkipPending={skipRedrawMutation.isPending}
      onContinue={() => {
        void navigate({
          to: '/recollection/$serviceRequestId/schedule',
          params: { serviceRequestId },
        });
      }}
      onConfirmSkip={async () => {
        await skipRedrawMutation.mutateAsync(serviceRequestId);
        toast.success('Recollection skipped!');
        await navigate({ to: '/', replace: true });
        void queryClient.invalidateQueries({
          queryKey: getRedrawsQueryOptions().queryKey,
        });
      }}
    />
  );
}
