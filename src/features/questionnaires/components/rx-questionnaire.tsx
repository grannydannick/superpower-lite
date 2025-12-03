import { useState } from 'react';

// TODO: move data fetching upstream, or make this a global component
// eslint-disable-next-line import/no-restricted-paths
import { NotFoundRoute } from '@/app/routes/not-found';
import { QuestionnaireForm } from '@/components/ui/questionnaire';
import { RxScreenOut } from '@/components/ui/questionnaire/rx-screen-out';
import { Spinner } from '@/components/ui/spinner';
import { useQuestionnaire } from '@/features/questionnaires/api/get-questionnaire';
import { useQuestionnaireResponse } from '@/features/questionnaires/api/get-questionnaire-response';
import { useUpdateQuestionnaireResponse } from '@/features/questionnaires/api/update-questionnaire-response';
import { isMemberIneligible } from '@/features/questionnaires/utils/is-member-ineligible';
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
  const [showIneligibleScreen, setShowIneligibleScreen] =
    useState<boolean>(false);
  const userQuery = useUser();
  const updateQuestionnaireResponseMutation = useUpdateQuestionnaireResponse();

  const getQuestionnaireResponseQuery = useQuestionnaireResponse({
    identifier: name,
    statuses: ['in-progress', 'stopped'],
  });

  const questionnaireResponseId =
    getQuestionnaireResponseQuery.data?.questionnaireResponse?.id;

  const getQuestionnaireQuery = useQuestionnaire({
    identifier: name || '',
    queryConfig: {
      enabled: !!name,
    },
  });

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

  //TODO: move this upstream
  if (!getQuestionnaireQuery.data) {
    console.error('Questionnaire not found');
    return <NotFoundRoute />;
  }

  if (!userQuery.data) {
    console.error('User not found');
    return <NotFoundRoute />;
  }

  if (
    showIneligibleScreen &&
    getQuestionnaireResponseQuery.data?.questionnaireResponse != null
  ) {
    return (
      <RxScreenOut
        response={getQuestionnaireResponseQuery.data.questionnaireResponse}
      />
    );
  }

  return (
    <QuestionnaireForm
      questionnaire={getQuestionnaireQuery.data.questionnaire}
      response={
        getQuestionnaireResponseQuery.data?.questionnaireResponse ?? undefined
      }
      user={userQuery.data}
      onSave={(item) => {
        updateQuestionnaireResponseMutation.mutate({
          data: { item, status: 'in-progress' },
          identifier: questionnaireResponseId || name,
        });
      }}
      onSubmit={(item) => {
        const isIneligible = isMemberIneligible(
          item,
          getQuestionnaireQuery.data.questionnaire.item ?? [],
        );

        // NOTE(audric): server-side also handles frontdoor screenout logic.
        updateQuestionnaireResponseMutation.mutate({
          data: { item, status: 'completed' },
          identifier: questionnaireResponseId || name,
        });

        if (isIneligible == true) {
          setShowIneligibleScreen(true);
        } else {
          // NOTE(audric): includes case for inEligible === undefined;
          // on failure default to NP approval downstream flow
          onSubmit && onSubmit();
        }
      }}
      showIntro={showIntro}
      className="space-y-6"
    />
  );
};
