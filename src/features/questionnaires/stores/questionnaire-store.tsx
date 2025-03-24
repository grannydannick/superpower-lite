import { createContext, useContext, useRef, PropsWithChildren } from 'react';
import { shallow } from 'zustand/shallow';
import { useStoreWithEqualityFn } from 'zustand/traditional';

import {
  QuestionnaireStoreProps,
  QuestionnaireStore,
  QuestionnaireStoreApi,
  questionnaireStoreCreator,
} from '@/features/questionnaires/stores/questionnaire-store-creator';

export const QuestionnaireStoreContext = createContext<
  QuestionnaireStoreApi | undefined
>(undefined);

type QuestionnaireStoreProviderProps =
  PropsWithChildren<QuestionnaireStoreProps>;

export const QuestionnaireStoreProvider = ({
  children,
  ...props
}: QuestionnaireStoreProviderProps) => {
  const questionnaireStoreRef = useRef<QuestionnaireStoreApi>();
  if (!questionnaireStoreRef.current) {
    questionnaireStoreRef.current = questionnaireStoreCreator(props);
  }

  return (
    <QuestionnaireStoreContext.Provider value={questionnaireStoreRef.current}>
      {children}
    </QuestionnaireStoreContext.Provider>
  );
};

export type UseQuestionnaireStoreContextSelector<T> = (
  store: QuestionnaireStore,
) => T;

export const useQuestionnaireStore = <T,>(
  selector: UseQuestionnaireStoreContextSelector<T>,
): T => {
  const questionnaireStoreContext = useContext(QuestionnaireStoreContext);

  if (questionnaireStoreContext === undefined) {
    throw new Error(
      'useQuestionnaireStore must be used within QuestionnaireStoreProvider',
    );
  }

  return useStoreWithEqualityFn(questionnaireStoreContext, selector, shallow);
};
