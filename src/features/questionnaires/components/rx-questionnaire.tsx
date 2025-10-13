import { QuestionnaireForm } from '@/components/ui/questionnaire';
import { Spinner } from '@/components/ui/spinner';
import { useQuestionnaire } from '@/features/questionnaires/api/get-questionnaire';
import { useQuestionnaireResponse } from '@/features/questionnaires/api/get-questionnaire-response';
import { useUpdateQuestionnaireResponse } from '@/features/questionnaires/api/update-questionnaire-response';
import { QuestionnaireName } from '@/types/api';

export const RxQuestionnaire = ({
  showIntro = false,
  name,
  onSubmit,
}: {
  showIntro?: boolean;
  name: QuestionnaireName;
  onSubmit?: () => void;
}) => {
  const updateQuestionnaireResponseMutation = useUpdateQuestionnaireResponse();

  const getQuestionnaireQuery = useQuestionnaire({
    questionnaireName: name,
  });

  const getQuestionnaireResponseQuery = useQuestionnaireResponse({
    questionnaireName: name,
    statuses: ['in-progress', 'stopped'],
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
          questionnaireName: name,
        });
      }}
      onSubmit={(item) => {
        updateQuestionnaireResponseMutation.mutate({
          data: { item, status: 'completed' },
          questionnaireName: name,
        });
        onSubmit && onSubmit();
      }}
      showIntro={showIntro}
      className="space-y-6"
    />
  );
};
