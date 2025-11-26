import { useRef } from 'react';

import { QuestionnaireForm } from '@/components/ui/questionnaire';
import { Spinner } from '@/components/ui/spinner';
import { useQuestionnaire } from '@/features/questionnaires/api/get-questionnaire';
import { useQuestionnaireResponse } from '@/features/questionnaires/api/get-questionnaire-response';
import { useUpdateQuestionnaireResponse } from '@/features/questionnaires/api/update-questionnaire-response';
import { useUser } from '@/lib/auth';
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
  const { data: user } = useUser();

  const getQuestionnaireResponseQuery = useQuestionnaireResponse({
    identifier: name,
    statuses: ['in-progress', 'stopped'],
  });

  // Extract questionnaire ID from the response
  const questionnaireId =
    getQuestionnaireResponseQuery.data?.questionnaireResponse?.questionnaire;

  const questionnaireResponseId =
    getQuestionnaireResponseQuery.data?.questionnaireResponse?.id;

  // Pin identifier after initial load - response updates change the questionnaire ref, causing remounts
  const questionnaireIdentifierRef = useRef<string | null>(null);
  const prevNameRef = useRef(name);

  if (prevNameRef.current !== name) {
    questionnaireIdentifierRef.current = null;
    prevNameRef.current = name;
  }

  if (!questionnaireIdentifierRef.current) {
    questionnaireIdentifierRef.current = questionnaireId || name;
  }

  const getQuestionnaireQuery = useQuestionnaire({
    identifier: questionnaireIdentifierRef.current,
    queryConfig: {
      enabled: !!questionnaireIdentifierRef.current,
    },
  });

  // Show spinner only on initial fetch, not on save-triggered refetches
  const isInitialLoading =
    (getQuestionnaireQuery.isLoading && !getQuestionnaireQuery.data) ||
    (getQuestionnaireResponseQuery.isLoading &&
      getQuestionnaireResponseQuery.data === undefined);

  if (isInitialLoading) {
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
          identifier: questionnaireResponseId || name,
        });
      }}
      onSubmit={(item) => {
        updateQuestionnaireResponseMutation.mutate({
          data: { item, status: 'completed' },
          identifier: questionnaireResponseId || name,
        });
        onSubmit && onSubmit();
      }}
      showIntro={showIntro}
      user={user}
      className="space-y-6"
    />
  );
};
