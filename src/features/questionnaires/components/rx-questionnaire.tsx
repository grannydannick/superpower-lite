import { useState } from 'react';

import { QuestionnaireForm } from '@/components/ui/questionnaire';
import { RxScreenOut } from '@/components/ui/questionnaire/rx-screen-out';
import { Spinner } from '@/components/ui/spinner';
import { useQuestionnaire } from '@/features/questionnaires/api/get-questionnaire';
import { useQuestionnaireResponse } from '@/features/questionnaires/api/get-questionnaire-response';
import { useUpdateQuestionnaireResponse } from '@/features/questionnaires/api/update-questionnaire-response';
import { isMemberIneligible } from '@/features/questionnaires/utils/is-member-ineligible';
import { useUser } from '@/lib/auth';
import { QuestionnaireName } from '@/types/api';

import { isGLP1FrontDoorExperiment } from '../../../components/ui/questionnaire/utils/questionnaire-utils';

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

  const questionnaireRef =
    getQuestionnaireResponseQuery.data?.questionnaireResponse?.questionnaire;

  const questionnaireResponseId =
    getQuestionnaireResponseQuery.data?.questionnaireResponse?.id;

  const getQuestionnaireQuery = useQuestionnaire({
    identifier: questionnaireRef || '',
    queryConfig: {
      enabled: !!questionnaireRef,
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

  if (
    !getQuestionnaireQuery.data?.questionnaire ||
    !getQuestionnaireResponseQuery.data?.questionnaireResponse ||
    !userQuery.data
  ) {
    return <div>Questionnaire not found</div>;
  }

  const isFrontdoorExperiment = isGLP1FrontDoorExperiment(
    getQuestionnaireResponseQuery.data?.questionnaireResponse,
  );

  if (showIneligibleScreen) {
    return <RxScreenOut isFrontdoorExperiment={isFrontdoorExperiment} />;
  }

  return (
    <QuestionnaireForm
      questionnaire={getQuestionnaireQuery.data.questionnaire}
      response={getQuestionnaireResponseQuery.data.questionnaireResponse}
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
