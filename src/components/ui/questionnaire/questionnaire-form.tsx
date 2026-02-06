import {
  Questionnaire,
  QuestionnaireResponse,
  QuestionnaireResponseItem,
} from '@medplum/fhirtypes';

import { User } from '@/types/api';

import { QuestionnaireFormPageSequence } from './questionnaire-page-sequence';
import {
  QuestionnaireStoreProvider,
  useQuestionnaireStore,
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
  const response = useQuestionnaireStore((s) => s.response);
  const { activeStep } = useQuestionnaireStore((s) => s);
  const checkForQuestionEnabled = useQuestionnaireStore(
    (s) => s.checkForQuestionEnabled,
  );
  const getNumberOfPages = useQuestionnaireStore((s) => s.getNumberOfPages);
  const getLastQuestion = useQuestionnaireStore((s) => s.getLastQuestion);

  const isLastStep = activeStep === getNumberOfPages() - 1;
  const lastQuestion = getLastQuestion();

  const handleSubmit = () => {
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
    <form
      className={className}
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      <QuestionnaireFormPageSequence
        onSave={onSave}
        initialProgressPercent={initialProgressPercent}
      />
    </form>
  );
};
