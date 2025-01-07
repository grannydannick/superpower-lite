import { useShallow } from 'zustand/react/shallow';

import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTrigger,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { Body2, H2 } from '@/components/ui/typography';
import { usePlan } from '@/features/action-plan/stores/plan-store';
import { useCurrentPatient } from '@/features/rdns/hooks/use-current-patient';

export const PublishAlertDialog = () => {
  const { isUpdating, updateActionPlan } = usePlan(useShallow((s) => s));
  const { selectedPatient } = useCurrentPatient();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button className="min-w-[103px] rounded-[12px] bg-black px-6 py-3 text-white shadow-md">
          Publish
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="w-[560px] p-10">
        <AlertDialogHeader className="items-center justify-center pb-10 pt-4">
          <H2>Publish action plan</H2>
          <Body2 className="w-[373px] text-center text-zinc-500">
            Once your action plan has been published{' '}
            {selectedPatient?.firstName}&nbsp;
            {selectedPatient?.lastName} will be notified. This action cannot be
            undone.
          </Body2>
        </AlertDialogHeader>
        <AlertDialogFooter className="w-full gap-2 sm:flex-col sm:space-x-0">
          {!isUpdating && (
            <AlertDialogCancel className="ml-0 w-full">
              Continue editing
            </AlertDialogCancel>
          )}
          <AlertDialogAction
            className="w-full"
            onClick={() => updateActionPlan(true)}
          >
            {isUpdating ? <Spinner variant="primary" /> : 'Publish'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
