import { QuestionnaireForm } from '@/components/ui/questionnaire';
import { Spinner } from '@/components/ui/spinner';
import { INTAKE_QUESTIONNAIRE } from '@/const/questionnaire';
import { useQuestionnaire } from '@/features/questionnaires/api/get-questionnaire';
import { useQuestionnaireResponse } from '@/features/questionnaires/api/get-questionnaire-response';
import { useUpdateQuestionnaireResponse } from '@/features/questionnaires/api/update-questionnaire-response';
import { useUser } from '@/lib/auth';

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
  const questionnaireRef =
    getQuestionnaireResponseQuery.data?.questionnaireResponse?.questionnaire;

  const questionnaireResponseId =
    getQuestionnaireResponseQuery.data?.questionnaireResponse?.id ||
    INTAKE_QUESTIONNAIRE;

  const getQuestionnaireQuery = useQuestionnaire({
    identifier: questionnaireRef || '',
    queryConfig: {
      enabled: !!questionnaireRef,
    },
  });

  const userQuery = useUser();

  if (
    getQuestionnaireQuery.isLoading ||
    getQuestionnaireResponseQuery.isLoading ||
    userQuery.isLoading
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
    !questionnaireRef ||
    !userQuery.data
  ) {
    return null;
  }

  return (
    <QuestionnaireForm
      questionnaire={getQuestionnaireQuery.data.questionnaire}
      response={getQuestionnaireResponseQuery.data.questionnaireResponse}
      user={userQuery.data}
      onSave={(item) => {
        updateQuestionnaireResponseMutation.mutate({
          data: { item, status: 'in-progress' },
          identifier: questionnaireResponseId,
          invalidateIdentifiers: [INTAKE_QUESTIONNAIRE],
        });
      }}
      onSubmit={(item) => {
        updateQuestionnaireResponseMutation.mutate({
          data: { item, status: 'completed' },
          identifier: questionnaireResponseId,
          invalidateIdentifiers: [INTAKE_QUESTIONNAIRE],
        });
        onSubmit?.();
      }}
      showIntro={showIntro}
      className="space-y-6"
    />
  );
};
