import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import { Body2 } from '@/components/ui/typography';
import { getPlansQueryOptions } from '@/features/action-plan/api';
import { PublishAlertDialog } from '@/features/action-plan/components/publish-alert-dialog';
import { useShowBg } from '@/features/action-plan/hooks/use-show-bg';
import { usePlan } from '@/features/action-plan/stores/plan-store';
import { useUser } from '@/lib/auth';
import { cn } from '@/lib/utils';

export const ClinicianNoteHeader = () => {
  const {
    isAdmin,
    published,
    isUpdating,
    updateIsAdmin,
    updatedAt,
    _makeFinalUpdate,
  } = usePlan((s) => s);
  const { data: user } = useUser();
  const navigate = useNavigate();
  const isBlurred = useShowBg();

  const queryClient = useQueryClient();

  const closePlan = async () => {
    /**
     * We don't use isAdmin because we can overwrite it with "Preview"
     */
    if (user?.adminActor) {
      /**
       * Give enough time for all debounces to finish before closing to properly save content
       */
      await _makeFinalUpdate();
      /**
       *  We invalidate here because action plan store doesn't use React Query,
       *  therefore by the time we come back from editing our RTK cache might still be present
       *  it will load action plan with cached value and overwrite it if we don't revalidate cache
       */
      await queryClient.invalidateQueries({
        queryKey: getPlansQueryOptions().queryKey,
      });
    }

    navigate('/', { replace: true });
  };

  return (
    <div
      className={cn(
        'sticky z-10 left-0 top-0 flex w-full justify-between p-5 md:p-7 transition duration-300',
        isBlurred ? 'bg-opacity-40 bg-white backdrop-blur rounded-b-2xl' : null,
      )}
    >
      <div className="flex items-center justify-center gap-4">
        <Button
          className="size-[44px] rounded-full bg-white p-0 shadow-xl hover:bg-white"
          onClick={closePlan}
        >
          <X width="16px" height="16px" color="#52525B" />
        </Button>
        <div>
          <h1 className="text-sm">
            For: {user?.firstName} {user?.lastName}
          </h1>
        </div>
      </div>
      {user?.adminActor ? (
        <div className="flex items-center gap-4">
          {isUpdating ? (
            <div className="flex items-center gap-2">
              <Spinner variant="primary" />
              <Body2>Saving...</Body2>
            </div>
          ) : (
            <Body2 className="hidden sm:block">
              Last updated: {format(new Date(updatedAt), 'h:mm a')}
            </Body2>
          )}
          <div className="flex items-center gap-2 rounded-[12px] bg-white px-4 py-3 shadow-md">
            <p className="text-sm">Preview</p>
            <Switch
              checked={!isAdmin}
              onCheckedChange={() => updateIsAdmin(!isAdmin)}
            />
          </div>
          {!published && <PublishAlertDialog />}
        </div>
      ) : null}
    </div>
  );
};
