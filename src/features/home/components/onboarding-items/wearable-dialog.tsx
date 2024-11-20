import { VitalLinkButton } from '@/features/settings/components/vital-button';
import { useUpdateQuestionnaire } from '@/features/users/api/update-questionnaire';

export const WearableDialog = ({
  questionnaireId,
}: {
  questionnaireId: string;
}) => {
  const { mutate } = useUpdateQuestionnaire();

  return (
    <VitalLinkButton
      variant="outline"
      size="medium"
      className="bg-white"
      callback={() =>
        mutate({
          data: { status: 'ACTIVE' },
          questionnaireId: questionnaireId,
        })
      }
    >
      Connect
    </VitalLinkButton>
  );
};
