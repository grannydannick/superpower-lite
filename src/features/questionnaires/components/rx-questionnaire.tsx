import {
  Questionnaire,
  QuestionnaireResponse,
  QuestionnaireResponseItem,
} from '@medplum/fhirtypes';
import { useState } from 'react';

// TODO: move data fetching upstream, or make this a global component
import { NotFoundRoute } from '@/app/routes/not-found';
import { QuestionnaireForm } from '@/components/ui/questionnaire';
import { RxScreenOut } from '@/components/ui/questionnaire/rx-screen-out';
import { Spinner } from '@/components/ui/spinner';
import { RxQuestionnaireName } from '@/const/questionnaire';
import { useQuestionnaireResponseController } from '@/features/questionnaires/hooks/use-questionnaire-response-controller';
import { isMemberIneligible } from '@/features/questionnaires/utils/is-member-ineligible';
import { useUser } from '@/lib/auth';

export const RxQuestionnaire = ({
  name,
  onSubmit,
}: {
  name: RxQuestionnaireName;
  onSubmit?: () => void;
}) => {
  const [showIneligibleScreen, setShowIneligibleScreen] =
    useState<boolean>(false);
  const userQuery = useUser();
  const {
    questionnaire,
    response: questionnaireResponse,
    isLoading: isQuestionnaireLoading,
    save,
    submit,
  } = useQuestionnaireResponseController({
    questionnaireName: name,
    statuses: ['in-progress', 'stopped'],
  });

  if (isQuestionnaireLoading || userQuery.isLoading) {
    return (
      <div className="flex h-dvh w-full items-center justify-center">
        <Spinner variant="primary" size="md" />
      </div>
    );
  }

  //TODO: move this upstream
  if (!questionnaire) {
    console.error('Questionnaire not found');
    return <NotFoundRoute />;
  }

  if (!userQuery.data) {
    console.error('User not found');
    return <NotFoundRoute />;
  }

  if (showIneligibleScreen && questionnaireResponse != null) {
    return (
      <RxScreenOut
        response={questionnaireResponse as unknown as QuestionnaireResponse}
      />
    );
  }

  const handleSave = (item: QuestionnaireResponseItem[]) => {
    save(item);
  };

  const handleSubmit = (item: QuestionnaireResponseItem[]) => {
    if (!questionnaire) return;
    const isIneligible = isMemberIneligible(
      item,
      (questionnaire as Questionnaire).item ?? [],
    );

    // NOTE(audric): server-side also handles frontdoor screenout logic.
    submit(item, {
      onSuccess: () => {
        if (isIneligible == true) {
          setShowIneligibleScreen(true);
        } else {
          // NOTE(audric): includes case for inEligible === undefined;
          // on failure default to NP approval downstream flow
          onSubmit && onSubmit();
        }
      },
    });
  };

  return (
    <QuestionnaireForm
      key={questionnaire.id}
      questionnaire={questionnaire as unknown as Questionnaire}
      response={
        (questionnaireResponse as unknown as QuestionnaireResponse) ?? undefined
      }
      user={userQuery.data}
      onSave={handleSave}
      onSubmit={handleSubmit}
      className="space-y-6"
    />
  );
};
