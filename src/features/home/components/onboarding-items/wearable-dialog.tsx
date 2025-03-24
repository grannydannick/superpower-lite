import { VitalLinkButton } from '@/features/settings/components/vital-button';
import { useUpdateTask } from '@/features/tasks/api/update-task';

export const WearableDialog = () => {
  const { mutate } = useUpdateTask();

  return (
    <VitalLinkButton
      variant="outline"
      size="medium"
      className="bg-white"
      callback={() =>
        mutate({
          data: { status: 'in-progress' },
          taskName: 'onboarding-wearable',
        })
      }
    >
      Connect
    </VitalLinkButton>
  );
};
