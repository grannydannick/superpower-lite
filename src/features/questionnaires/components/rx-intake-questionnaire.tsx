import { QuestionnaireForm } from '@/components/ui/questionnaire';
import { Spinner } from '@/components/ui/spinner';
import { RX_ASSESSMENT_GHK_CU } from '@/const/questionnaire';
import { useQuestionnaire } from '@/features/questionnaires/api/get-questionnaire';
import { useQuestionnaireResponse } from '@/features/questionnaires/api/get-questionnaire-response';
import { useUpdateQuestionnaireResponse } from '@/features/questionnaires/api/update-questionnaire-response';

export const RxIntakeQuestionnaire = ({
  showIntro = false,
  onSubmit,
}: {
  showIntro?: boolean;
  onSubmit?: () => void;
}) => {
  const updateQuestionnaireResponseMutation = useUpdateQuestionnaireResponse();

  const getQuestionnaireQuery = useQuestionnaire({
    questionnaireName: RX_ASSESSMENT_GHK_CU,
  });

  const getQuestionnaireResponseQuery = useQuestionnaireResponse({
    questionnaireName: RX_ASSESSMENT_GHK_CU,
  });

  if (
    getQuestionnaireQuery.isLoading ||
    getQuestionnaireResponseQuery.isLoading
  ) {
    return (
      <div className="flex h-dvh w-full items-center justify-center">
        <Spinner variant="primary" size="md" />
      </div>
    );
  }

  if (!getQuestionnaireQuery.data) {
    return null;
  }

  return (
    <QuestionnaireForm
      questionnaire={getQuestionnaireQuery.data.questionnaire}
      response={
        getQuestionnaireResponseQuery?.data?.questionnaireResponse ?? undefined
      }
      onSave={(item) => {
        updateQuestionnaireResponseMutation.mutate({
          data: { item, status: 'in-progress' },
          questionnaireName: RX_ASSESSMENT_GHK_CU,
        });
      }}
      onSubmit={(item) => {
        updateQuestionnaireResponseMutation.mutate({
          data: { item, status: 'completed' },
          questionnaireName: RX_ASSESSMENT_GHK_CU,
        });
        onSubmit && onSubmit();
      }}
      showIntro={showIntro}
      className="space-y-6"
    />
  );
};
