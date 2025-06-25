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
import { mergeResponseItems } from './utils';

/**
 * This component is used to render a questionnaire form.
 * It takes a questionnaire, a response, and onSave and onSubmit functions.
 * The onSave function is called to save the questionnaire response step by step.
 * It also takes a className prop to style the form.
 * It also takes a showIntro prop to show the intro page.
 */
export const QuestionnaireForm = ({
  questionnaire,
  response,
  onSave,
  onSubmit,
  className,
  showIntro = true,
  user,
}: {
  questionnaire: Questionnaire;
  response: QuestionnaireResponse;
  onSave: (item: QuestionnaireResponseItem[]) => void;
  onSubmit: (item: QuestionnaireResponseItem[]) => void;
  className?: string;
  showIntro?: boolean;
  user?: User;
}) => {
  // Process the questionnaire to include both initial values and any existing responses
  const mergedQuestionnaire = {
    ...questionnaire,
    item: questionnaire.item
      ? mergeResponseItems(questionnaire.item, response.item || [])
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
        showIntro={showIntro}
      />
    </QuestionnaireStoreProvider>
  );
};

const QuestionnaireFormConsumer = ({
  onSave,
  onSubmit,
  className,
  showIntro,
}: {
  onSave: (item: QuestionnaireResponseItem[]) => void;
  onSubmit: (item: QuestionnaireResponseItem[]) => void;
  className?: string;
  showIntro: boolean;
}) => {
  const response = useQuestionnaireStore((s) => s.response);
  const { activeStep } = useQuestionnaireStore((s) => s);
  const getNumberOfPages = useQuestionnaireStore((s) => s.getNumberOfPages);
  const getLastQuestion = useQuestionnaireStore((s) => s.getLastQuestion);

  const isLastStep = activeStep === getNumberOfPages() - 1;
  const lastQuestion = getLastQuestion();

  const handleSubmit = () => {
    if (response.item && isLastStep && lastQuestion) {
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

      const lastResponse = findResponse(response.item, lastQuestion.linkId);

      if (
        (lastQuestion.required &&
          lastResponse?.answer &&
          lastResponse.answer.length > 0) ||
        !lastQuestion.required
      ) {
        onSubmit(response.item);
      }
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
      <QuestionnaireFormPageSequence onSave={onSave} showIntro={showIntro} />
    </form>
  );
};
