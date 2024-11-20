import { BridgeButton } from '@/features/settings/components/bridge-button';
import { useUpdateQuestionnaire } from '@/features/users/api/update-questionnaire';

export const InsuranceDialog = ({
  questionnaireId,
}: {
  questionnaireId: string;
}) => {
  const { mutate } = useUpdateQuestionnaire();
  return (
    <BridgeButton
      // Initial MNT visit hardcoded right now
      serviceTypeId="svt_NWFtK8b7YadPDkWq"
      variant="outline"
      size="medium"
      className="bg-white"
      callback={() =>
        // this is temp hack because we don't have any backend support
        mutate({
          data: { status: 'COMPLETE' },
          questionnaireId: questionnaireId,
        })
      }
    >
      Complete
    </BridgeButton>
  );
};
