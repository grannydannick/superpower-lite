import { QuestionnaireForm } from '@/components/ui/questionnaire';
import { Spinner } from '@/components/ui/spinner';
import { INTAKE_QUESTIONNAIRE } from '@/const/questionnaire';
import { useQuestionnaire } from '@/features/questionnaires/api/get-questionnaire';
import { useQuestionnaireResponse } from '@/features/questionnaires/api/get-questionnaire-response';
import { useUpdateQuestionnaireResponse } from '@/features/questionnaires/api/update-questionnaire-response';

export const IntakeQuestionnaire = ({
  showIntro = true,
  onSubmit,
}: {
  showIntro: boolean;
  onSubmit?: () => void;
}) => {
  const updateQuestionnaireResponseMutation = useUpdateQuestionnaireResponse();

  const getQuestionnaireResponseQuery = useQuestionnaireResponse({
    identifier: INTAKE_QUESTIONNAIRE,
    statuses: ['in-progress', 'stopped'],
  });

  // Extract questionnaire ID from the response
  const questionnaireId =
    getQuestionnaireResponseQuery.data?.questionnaireResponse?.questionnaire;

  const getQuestionnaireQuery = useQuestionnaire({
    identifier: questionnaireId || '',
    queryConfig: {
      enabled: !!questionnaireId,
    },
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

  if (
    !getQuestionnaireQuery.data ||
    !getQuestionnaireResponseQuery.data ||
    getQuestionnaireResponseQuery.data.questionnaireResponse === null ||
    !questionnaireId
  ) {
    return null;
  }

  return (
    <QuestionnaireForm
      questionnaire={getQuestionnaireQuery.data.questionnaire}
      response={getQuestionnaireResponseQuery.data.questionnaireResponse}
      onSave={(item) => {
        updateQuestionnaireResponseMutation.mutate({
          data: { item, status: 'in-progress' },
          identifier: INTAKE_QUESTIONNAIRE,
        });
      }}
      onSubmit={(item) => {
        updateQuestionnaireResponseMutation.mutate({
          data: { item, status: 'completed' },
          identifier: INTAKE_QUESTIONNAIRE,
        });
        onSubmit && onSubmit();
      }}
      showIntro={showIntro}
      className="space-y-6"
    />
  );
};
