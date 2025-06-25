import {
  Questionnaire,
  QuestionnaireItem,
  QuestionnaireResponse,
  QuestionnaireResponseItem,
} from '@medplum/fhirtypes';
import { toast } from 'sonner';
import { createStore } from 'zustand';

import { User } from '@/types/api';

import {
  buildInitialResponse,
  isQuestionEnabled,
  QuestionnaireItemType,
} from '../utils';

export interface QuestionnaireStoreProps {
  questionnaire: Questionnaire;
  initialResponse?: QuestionnaireResponse;
  user?: User;
}

export interface QuestionnaireStore extends QuestionnaireStoreProps {
  response: QuestionnaireResponse;
  activeStep: number;
  currentGroup: QuestionnaireItem | null;
  currentQuestion: QuestionnaireItem | null;
  direction: 'forward' | 'backward';
  lastQuestion: QuestionnaireItem | null;
  initialResponse?: QuestionnaireResponse;

  setItems: (
    newResponseItems: QuestionnaireResponseItem | QuestionnaireResponseItem[],
  ) => void;
  checkForQuestionEnabled: (item: QuestionnaireItem) => boolean;
  getNumberOfPages: () => number;
  nextStep: () => void;
  prevStep: () => void;
  getCurrentGroup: () => QuestionnaireItem | null;
  getCurrentQuestion: () => QuestionnaireItem | null;
  forceStep: (step: number) => void;
  jumpToQuestion: (linkId: string) => void;
  getLastQuestion: () => QuestionnaireItem | null;
}

export type QuestionnaireStoreApi = ReturnType<
  typeof questionnaireStoreCreator
>;

export const questionnaireStoreCreator = (
  initProps: QuestionnaireStoreProps,
) => {
  return createStore<QuestionnaireStore>()((set, get) => {
    const initialResponse =
      initProps.initialResponse ||
      buildInitialResponse(initProps.questionnaire, initProps.user);

    const getAllQuestions = () => {
      const { questionnaire, response } = get();
      const result: Array<{
        question: QuestionnaireItem;
        group: QuestionnaireItem | null;
        isGroupCover?: boolean;
      }> = [];

      questionnaire.item?.forEach((item) => {
        if (item.type === QuestionnaireItemType.group && item.item) {
          if (!isQuestionEnabled(item, response?.item ?? [])) {
            return;
          }

          item.item.forEach((subItem) => {
            if (isQuestionEnabled(subItem, response?.item ?? [])) {
              result.push({ question: subItem, group: item });
            }
          });
        } else if (isQuestionEnabled(item, response?.item ?? [])) {
          result.push({ question: item, group: null });
        }
      });

      return result;
    };

    const findLastGroupWithAnswers = (
      responseItems: QuestionnaireResponseItem[],
    ): string | null => {
      const groupsWithAnswers: string[] = [];

      const checkGroupForAnswers = (
        groupId: string,
        items: QuestionnaireResponseItem[],
      ): boolean => {
        let hasAnswer = false;

        for (const item of items) {
          if (item.answer && item.answer.length > 0) {
            hasAnswer = true;
          }

          if (item.item) {
            hasAnswer = checkGroupForAnswers(groupId, item.item) || hasAnswer;
          }
        }

        return hasAnswer;
      };

      for (const item of responseItems) {
        if (!item.item || item.item.length === 0) {
          continue;
        }

        if (checkGroupForAnswers(item.linkId, item.item)) {
          groupsWithAnswers.push(item.linkId);
        }
      }

      return groupsWithAnswers.length > 0
        ? groupsWithAnswers[groupsWithAnswers.length - 1]
        : null;
    };

    const findLastQuestionWithAnswers = (
      lastGroupId: string,
      responseItems: QuestionnaireResponseItem[],
    ): QuestionnaireResponseItem | null => {
      // First find the group
      const groupResponse = responseItems.find(
        (item) => item.linkId === lastGroupId,
      );

      if (!groupResponse || !groupResponse.item) {
        return null;
      }

      // Find the last question in the group that has an answer
      const questionsWithAnswers = groupResponse.item.filter(
        (item) => item.answer && item.answer.length > 0,
      );

      return questionsWithAnswers.length > 0
        ? questionsWithAnswers[questionsWithAnswers.length - 1]
        : null;
    };

    const findInitialStep = () => {
      if (!initProps.initialResponse) {
        return 0;
      }

      const lastGroupWithAnswers = findLastGroupWithAnswers(
        initialResponse.item || [],
      );

      if (!lastGroupWithAnswers) {
        return 0;
      }

      const initialQuestions =
        initProps.questionnaire.item?.reduce<
          Array<{
            question: QuestionnaireItem;
            group: QuestionnaireItem | null;
          }>
        >((acc, item) => {
          if (item.type === QuestionnaireItemType.group && item.item) {
            if (!isQuestionEnabled(item, initialResponse?.item ?? [])) {
              return acc;
            }

            item.item.forEach((subItem) => {
              if (isQuestionEnabled(subItem, initialResponse?.item ?? [])) {
                acc.push({ question: subItem, group: item });
              }
            });
          } else if (isQuestionEnabled(item, initialResponse?.item ?? [])) {
            acc.push({ question: item, group: null });
          }
          return acc;
        }, []) || [];

      // Find the last answered question
      const lastQuestion = findLastQuestionWithAnswers(
        lastGroupWithAnswers,
        initialResponse.item || [],
      );

      if (!lastQuestion) {
        return 0;
      }

      // Find the index of the question that comes after the last answered question
      for (let i = 0; i < initialQuestions.length; i++) {
        const question = initialQuestions[i];

        if (question.group && question.group.linkId === lastGroupWithAnswers) {
          if (question.question.linkId === lastQuestion.linkId) {
            // Return the next question after the last answered one
            return Math.min(i + 1, initialQuestions.length - 1);
          }
        }
      }

      return 0;
    };

    const initialStep = findInitialStep();

    const initialQuestions =
      initProps.questionnaire.item?.reduce<
        Array<{
          question: QuestionnaireItem;
          group: QuestionnaireItem | null;
        }>
      >((acc, item) => {
        if (item.type === QuestionnaireItemType.group && item.item) {
          if (!isQuestionEnabled(item, initialResponse?.item ?? [])) {
            return acc;
          }

          item.item.forEach((subItem) => {
            if (isQuestionEnabled(subItem, initialResponse?.item ?? [])) {
              acc.push({ question: subItem, group: item });
            }
          });
        } else if (isQuestionEnabled(item, initialResponse?.item ?? [])) {
          acc.push({ question: item, group: null });
        }
        return acc;
      }, []) || [];

    const initialGroup = initialQuestions[initialStep]?.group ?? null;
    const initialQuestion = initialQuestions[initialStep]?.question ?? null;

    // Cleans conditional responses when disabling condition
    const cleanResponseWhenDisabled = (
      responseItems: QuestionnaireResponseItem[] = [],
      parentContext: QuestionnaireResponseItem[] = [],
      parentDisabled: boolean = false,
    ): QuestionnaireResponseItem[] => {
      const { questionnaire } = get();
      const allResponseItems = [...parentContext, ...responseItems];

      const cleanedItems: QuestionnaireResponseItem[] = [];

      // Process each response item
      for (const responseItem of responseItems) {
        // Skip if parent is disabled
        if (parentDisabled) {
          continue;
        }

        // Find the corresponding questionnaire item
        const questionnaireItem = findQuestionnaireItemByLinkId(
          questionnaire.item || [],
          responseItem.linkId,
        );

        // Check if this item is enabled
        const isEnabled =
          !questionnaireItem ||
          questionnaireItem.type === QuestionnaireItemType.group ||
          isQuestionEnabled(questionnaireItem, allResponseItems);

        if (isEnabled) {
          if (responseItem.item && responseItem.item.length > 0) {
            // Process nested items, passing the disabled status of parent
            const currentItemDisabled =
              questionnaireItem &&
              questionnaireItem.type === QuestionnaireItemType.group &&
              !isQuestionEnabled(questionnaireItem, allResponseItems);

            const cleanedNestedItems = cleanResponseWhenDisabled(
              responseItem.item,
              allResponseItems,
              currentItemDisabled,
            );

            // Only keep the group if it has nested items after cleaning
            if (cleanedNestedItems.length > 0) {
              cleanedItems.push({
                ...responseItem,
                item: cleanedNestedItems,
              });
            } else if (responseItem.answer && responseItem.answer.length > 0) {
              // Keep the item if it has answers but no children
              cleanedItems.push(responseItem);
            }
          } else {
            // Keep enabled items
            cleanedItems.push(responseItem);
          }
        }
        // If not enabled, the item is excluded (not added to cleanedItems)
      }

      return cleanedItems;
    };

    // Helper function to find a questionnaire item by linkId
    const findQuestionnaireItemByLinkId = (
      items: QuestionnaireItem[] = [],
      linkId: string,
    ): QuestionnaireItem | undefined => {
      for (const item of items) {
        if (item.linkId === linkId) {
          return item;
        }

        // Check nested items if this is a group
        if (item.type === QuestionnaireItemType.group && item.item) {
          const found = findQuestionnaireItemByLinkId(item.item, linkId);
          if (found) {
            return found;
          }
        }
      }

      return undefined;
    };

    return {
      ...initProps,
      response: initialResponse,
      activeStep: initialStep,
      currentGroup: initialGroup,
      currentQuestion: initialQuestion,
      direction: 'forward',

      getCurrentGroup: () => {
        const { activeStep } = get();
        const questions = getAllQuestions();
        return questions[activeStep]?.group ?? null;
      },

      getCurrentQuestion: () => {
        const { activeStep } = get();
        const questions = getAllQuestions();
        return questions[activeStep]?.question ?? null;
      },

      setItems: (newResponseItems) => {
        const { response, questionnaire, activeStep } = get();
        const currentItems = response?.item ?? [];
        const newItemsArray = Array.isArray(newResponseItems)
          ? newResponseItems
          : [newResponseItems];

        const findParentGroup = (
          linkId: string,
        ): QuestionnaireItem | undefined => {
          return questionnaire.item?.find(
            (item) =>
              item.type === 'group' &&
              item.item?.some((subItem) => subItem.linkId === linkId),
          );
        };

        const updatedItems = currentItems.map((item) => {
          const newItem = newItemsArray.find((ni) => ni.linkId === item.linkId);
          if (newItem) {
            return newItem;
          }

          if (item.item) {
            const updatedSubItems = item.item.map((subItem) => {
              const newSubItem = newItemsArray.find(
                (ni) => ni.linkId === subItem.linkId,
              );
              return newSubItem ?? subItem;
            });
            return { ...item, item: updatedSubItems };
          }

          return item;
        });

        newItemsArray.forEach((newItem) => {
          const exists = updatedItems.some(
            (item) =>
              item.linkId === newItem.linkId ||
              item.item?.some((subItem) => subItem.linkId === newItem.linkId),
          );

          if (!exists) {
            const parentGroup = findParentGroup(newItem.linkId);
            if (parentGroup) {
              const existingGroup = updatedItems.find(
                (item) => item.linkId === parentGroup.linkId,
              );
              if (existingGroup) {
                existingGroup.item = existingGroup.item ?? [];
                existingGroup.item.push(newItem);
              } else {
                updatedItems.push({
                  linkId: parentGroup.linkId,
                  item: [newItem],
                });
              }
            } else {
              updatedItems.push(newItem);
            }
          }
        });

        // Clean up responses for items that are no longer enabled
        const cleanedItems = cleanResponseWhenDisabled(updatedItems, [], false);

        const newResponse: QuestionnaireResponse = {
          ...response,
          resourceType: 'QuestionnaireResponse',
          status: 'in-progress',
          item: cleanedItems,
        };

        set({ response: newResponse });

        const updatedQuestions = getAllQuestions();
        if (activeStep >= updatedQuestions.length) {
          set({ activeStep: Math.max(0, updatedQuestions.length - 1) });
        }
      },

      checkForQuestionEnabled: (item) => {
        const { response } = get();
        return isQuestionEnabled(item, response?.item ?? []);
      },

      getNumberOfPages: () => {
        return getAllQuestions().length;
      },

      lastQuestion: null,

      nextStep: () => {
        set({ direction: 'forward' });

        const { response, activeStep } = get();
        const questions = getAllQuestions();

        if (!questions.length) {
          return;
        }

        const { question: currentQuestion } = questions[activeStep];

        if (!isQuestionEnabled(currentQuestion, response?.item ?? [])) {
          const nextStep = activeStep + 1;

          if (nextStep >= questions.length) {
            toast.error('Can not complete questionnaire now.');
            return;
          }

          set({
            activeStep: nextStep,
            currentGroup: questions[nextStep]?.group ?? null,
            currentQuestion: questions[nextStep]?.question ?? null,
          });
          return;
        }

        const findResponse = (
          items: QuestionnaireResponseItem[] = [],
        ): QuestionnaireResponseItem | undefined => {
          for (const item of items) {
            if (item.linkId === currentQuestion.linkId) return item;
            if (item.item) {
              const found = findResponse(item.item);
              if (found) return found;
            }
          }
          return undefined;
        };

        const currentResponse = findResponse(response.item);

        if (currentQuestion.required) {
          if (!currentResponse?.answer || currentResponse.answer.length === 0) {
            toast.error('This question is required.');
            return;
          }
        }

        const nextStep = activeStep + 1;

        if (nextStep >= questions.length) {
          return;
        }

        const nextGroup = questions[nextStep]?.group ?? null;
        const nextQuestion = questions[nextStep]?.question ?? null;

        set({
          activeStep: nextStep,
          currentGroup: nextGroup,
          currentQuestion: nextQuestion,
        });
      },

      prevStep: () => {
        set({ direction: 'backward' });

        const { activeStep } = get();
        const questions = getAllQuestions();

        const prevStep = Math.max(0, activeStep - 1);
        const prevGroup = questions[prevStep]?.group ?? null;
        const prevQuestion = questions[prevStep]?.question ?? null;

        set({
          activeStep: prevStep,
          currentGroup: prevGroup,
          currentQuestion: prevQuestion,
        });
      },

      forceStep: (step: number) => {
        const questions = getAllQuestions();
        const validStep = Math.max(0, Math.min(step, questions.length - 1));

        set({
          activeStep: validStep,
          currentGroup: questions[validStep]?.group ?? null,
          currentQuestion: questions[validStep]?.question ?? null,
          direction: step > get().activeStep ? 'forward' : 'backward',
        });
      },

      getLastQuestion: () => {
        const questions = getAllQuestions();
        return questions[questions.length - 1]?.question ?? null;
      },

      jumpToQuestion: (linkId: string) => {
        const questions = getAllQuestions();
        const targetIndex = questions.findIndex(
          (q) => q.question.linkId === linkId,
        );

        if (targetIndex !== -1) {
          set({
            activeStep: targetIndex,
            currentGroup: questions[targetIndex]?.group ?? null,
            currentQuestion: questions[targetIndex]?.question ?? null,
            direction: targetIndex > get().activeStep ? 'forward' : 'backward',
          });
        }
      },
    };
  });
};
