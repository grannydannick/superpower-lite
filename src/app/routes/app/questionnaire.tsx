import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { Spinner } from '@/components/ui/spinner';
import { useQuestionnaire } from '@/features/questionnaires/api/get-questionnaire';
import { useUpdateQuestionnaireResponse } from '@/features/questionnaires/api/update-questionnaire-response';
import { QuestionnaireForm } from '@/features/questionnaires/components/questionnaire-form';
import { QuestionnaireName } from '@/types/api';

export const QuestionnaireRoute = () => {
  const { questionnaireName } = useParams();
  const navigate = useNavigate();
  const updateQuestionnaireResponseMutation = useUpdateQuestionnaireResponse({
    mutationConfig: {
      onSuccess: () => {
        toast.success('Thanks for submission!');
        navigate('/', { replace: true });
      },
    },
  });

  if (!questionnaireName) {
    navigate('/', { replace: true });
  }

  const questionnaireQuery = useQuestionnaire({
    questionnaireName: (questionnaireName as QuestionnaireName) ?? '',
    queryConfig: {
      enabled: !!questionnaireName,
    },
  });

  if (questionnaireQuery.isLoading) {
    return (
      <div className="flex w-full items-center justify-center">
        <Spinner variant="primary" size="md" />
      </div>
    );
  }

  if (!questionnaireQuery.data) {
    return null;
  }

  return (
    <QuestionnaireForm
      className="min-h-dvh"
      questionnaire={questionnaireQuery.data.questionnaire}
      onSubmit={(item) => {
        if (!questionnaireQuery.data.questionnaire.name) {
          toast.error('No questionnaire name found');
          return;
        }

        updateQuestionnaireResponseMutation.mutate({
          data: { item, status: 'completed' },
          questionnaireName: questionnaireQuery.data.questionnaire
            .name as QuestionnaireName,
        });
      }}
    />
  );
};
