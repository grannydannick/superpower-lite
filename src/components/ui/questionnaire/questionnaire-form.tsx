import {
  Questionnaire,
  QuestionnaireResponse,
  QuestionnaireResponseItem,
} from '@medplum/fhirtypes';
import { useContext } from 'react';

import { User } from '@/types/api';

import { QuestionnaireFormPageSequence } from './questionnaire-page-sequence';
import {
  QuestionnaireStoreContext,
  QuestionnaireStoreProvider,
} from './stores/questionnaire-store';
import { isResponseEmpty, mergeResponseItems } from './utils';

/**
 * This component is used to render a questionnaire form.
 * It takes a questionnaire, a response, and onSave and onSubmit functions.
 * The onSave function is called to save the questionnaire response step by step.
 * It also takes a className prop to style the form.
 */
export const QuestionnaireForm = ({
  questionnaire,
  response,
  onSave,
  onSubmit,
  className,
  user,
  initialProgressPercent,
}: {
  questionnaire: Questionnaire;
  response?: QuestionnaireResponse;
  user: User;
  onSave: (item: QuestionnaireResponseItem[]) => void;
  onSubmit: (item: QuestionnaireResponseItem[]) => void;
  className?: string;
  initialProgressPercent?: number;
}) => {
  // Process the questionnaire to include both initial values and any existing responses
  const mergedQuestionnaire = {
    ...questionnaire,
    item: questionnaire.item
      ? mergeResponseItems(questionnaire.item, response?.item ?? [])
      : undefined,
  };

  return (
    <QuestionnaireStoreProvider
      questionnaire={mergedQuestionnaire}
      initialResponse={response}
      user={user}
    >
      <QuestionnaireFormConsumer
        onSave={onSave}
        onSubmit={onSubmit}
        className={className}
        initialProgressPercent={initialProgressPercent}
      />
    </QuestionnaireStoreProvider>
  );
};

const QuestionnaireFormConsumer = ({
  onSave,
  onSubmit,
  className,
  initialProgressPercent,
}: {
  onSave: (item: QuestionnaireResponseItem[]) => void;
  onSubmit: (item: QuestionnaireResponseItem[]) => void;
  className?: string;
  initialProgressPercent?: number;
}) => {
  const questionnaireStoreContext = useContext(QuestionnaireStoreContext);
  if (questionnaireStoreContext == null) {
    throw new Error(
      'QuestionnaireForm must be used within QuestionnaireStoreProvider',
    );
  }

  const handleSubmit = () => {
    const {
      response,
      activeStep,
      checkForQuestionEnabled,
      getNumberOfPages,
      getLastQuestion,
    } = questionnaireStoreContext.getState();

    const numberOfPages = getNumberOfPages();
    const lastQuestion = getLastQuestion();
    const isLastStep = activeStep === numberOfPages - 1;

    if (!isLastStep || !lastQuestion) {
      return;
    }

    const responseItems = response.item ?? [];
    const findResponse = (
      items: QuestionnaireResponseItem[] = [],
      linkId: string,
    ): QuestionnaireResponseItem | undefined => {
      for (const item of items) {
        if (item.linkId === linkId) return item;
        if (item.item) {
          const found = findResponse(item.item, linkId);
          if (found) return found;
        }
      }
      return undefined;
    };

    const lastResponse = findResponse(responseItems, lastQuestion.linkId);
    const fallbackResponse = lastResponse ?? {
      linkId: lastQuestion.linkId,
      item: [],
    };
    const isLastResponseEmpty = Boolean(
      isResponseEmpty(lastQuestion, fallbackResponse, checkForQuestionEnabled),
    );

    if (
      (lastQuestion.required && !isLastResponseEmpty) ||
      !lastQuestion.required
    ) {
      onSubmit(responseItems);
      return;
    }
  };

  return (
    <div className={className}>
      <QuestionnaireFormPageSequence
        onSave={onSave}
        onFinalSubmit={handleSubmit}
        initialProgressPercent={initialProgressPercent}
      />
    </div>
  );
};
