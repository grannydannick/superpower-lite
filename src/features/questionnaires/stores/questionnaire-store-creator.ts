import {
  Questionnaire,
  QuestionnaireItem,
  QuestionnaireResponse,
  QuestionnaireResponseItem,
} from '@medplum/fhirtypes';
import { createStore } from 'zustand';

import { toast } from '@/components/ui/sonner';
import {
  buildInitialResponse,
  getNumberOfPages,
  isQuestionEnabled,
  mergeItems,
} from '@/features/questionnaires/utils/questionnaire';
import { validateQuestionnairePageErrors } from '@/features/questionnaires/utils/validate-response-page';

export interface QuestionnaireStoreProps {
  questionnaire: Questionnaire;
}

export interface QuestionnaireStore extends QuestionnaireStoreProps {
  response: QuestionnaireResponse;
  activeStep: number;
  errors: string[];

  setErrors: (newErrors: string[]) => void;
  setItems: (
    newResponseItems: QuestionnaireResponseItem | QuestionnaireResponseItem[],
  ) => void;
  checkForQuestionEnabled: (item: QuestionnaireItem) => boolean;
  getNumberOfPages: () => number;
  nextStep: () => void;
  prevStep: () => void;
}

export type QuestionnaireStoreApi = ReturnType<
  typeof questionnaireStoreCreator
>;

export const questionnaireStoreCreator = (
  initProps: QuestionnaireStoreProps,
) => {
  return createStore<QuestionnaireStore>()((set, get) => ({
    ...initProps,
    response: buildInitialResponse(initProps.questionnaire),
    activeStep: 0,
    errors: [],

    setErrors: (newErrors) => {
      set({ errors: newErrors });
    },
    setItems: (newResponseItems) => {
      const { response } = get();
      const currentItems = response?.item ?? [];

      const newItemsArray = Array.isArray(newResponseItems)
        ? newResponseItems
        : [newResponseItems];

      const mergedItems = mergeItems(currentItems, newItemsArray);

      const newResponse: QuestionnaireResponse = {
        ...response,
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        item: mergedItems,
      };

      set({ response: newResponse });
    },
    checkForQuestionEnabled: (item) => {
      const { response } = get();

      return isQuestionEnabled(item, response?.item ?? []);
    },
    getNumberOfPages: () => {
      const { questionnaire } = get();

      return getNumberOfPages(questionnaire);
    },

    nextStep: () => {
      const { questionnaire, response, activeStep } = get();

      const pageLinkId = questionnaire.item?.find(
        (_, index) => index === activeStep,
      )?.linkId;

      if (!pageLinkId) {
        toast.error('Can not complete questionnaire now.');
        return;
      }

      const errors = validateQuestionnairePageErrors(
        questionnaire,
        response.item ?? [],
        pageLinkId,
      );

      if (errors.length > 0) {
        set(() => ({ errors }));
        return;
      }

      set((state) => ({ activeStep: state.activeStep + 1 }));
    },

    prevStep: () => {
      set((state) => ({ activeStep: state.activeStep - 1 }));
    },
  }));
};
