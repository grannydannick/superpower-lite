import { useState } from 'react';

import { QuestionnaireForm } from '@/components/ui/questionnaire';
import { Spinner } from '@/components/ui/spinner';
import { useOrders } from '@/features/orders/api';
import { useQuestionnaire } from '@/features/questionnaires/api/get-questionnaire';
import { useQuestionnaireResponse } from '@/features/questionnaires/api/get-questionnaire-response';
import { useScreening } from '@/features/questionnaires/api/screening';
import { useUpdateQuestionnaireResponse } from '@/features/questionnaires/api/update-questionnaire-response';
import { ScreenOut } from '@/features/questionnaires/components/screen-out';
import { useUser } from '@/lib/auth';
import { QuestionnaireName } from '@/types/api';

export const ScreeningQuestionnaire = ({
  onSubmit,
  showIntro = true,
}: {
  onSubmit?: () => void;
  showIntro?: boolean;
}) => {
  const [isScreenedOut, setIsScreenedOut] = useState(false);
  const updateQuestionnaireResponseMutation = useUpdateQuestionnaireResponse();
  const screeningMutation = useScreening();
  const { data: user } = useUser();

  const getQuestionnaireQuery = useQuestionnaire({
    questionnaireName: 'onboarding-screening',
  });

  const getQuestionnaireResponseQuery = useQuestionnaireResponse({
    questionnaireName: 'onboarding-screening',
  });

  const getOrdersQuery = useOrders();

  if (
    getQuestionnaireQuery.isLoading ||
    getQuestionnaireResponseQuery.isLoading ||
    getOrdersQuery.isLoading
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
    !getOrdersQuery.data ||
    getQuestionnaireResponseQuery.data.questionnaireResponse === null
  ) {
    return null;
  }

  if (isScreenedOut) {
    return <ScreenOut />;
  }

  return (
    <QuestionnaireForm
      questionnaire={getQuestionnaireQuery.data.questionnaire}
      response={getQuestionnaireResponseQuery.data.questionnaireResponse}
      user={user}
      onSave={(item) => {
        updateQuestionnaireResponseMutation.mutate({
          data: { item, status: 'in-progress' },
          questionnaireName: 'onboarding-screening' as QuestionnaireName,
        });
      }}
      onSubmit={async (item) => {
        const response = await updateQuestionnaireResponseMutation.mutateAsync({
          data: { item, status: 'completed' },
          questionnaireName: 'onboarding-screening' as QuestionnaireName,
        });

        const screeningData = await screeningMutation.mutateAsync({
          data: {
            screeningResponse: response.questionnaireResponse,
          },
        });

        if (screeningData.isIneligible === true) {
          setIsScreenedOut(true);
          return;
        }

        onSubmit && onSubmit();
      }}
      showIntro={showIntro}
      className="space-y-6"
    />
  );
};
