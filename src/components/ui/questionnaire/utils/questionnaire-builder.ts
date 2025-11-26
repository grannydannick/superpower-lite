import { getReferenceString } from '@medplum/core';
import {
  Questionnaire,
  QuestionnaireItem,
  QuestionnaireItemInitial,
  QuestionnaireResponse,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer,
} from '@medplum/fhirtypes';

import { User } from '@/types/api';

import {
  RX_BILLING_PERIOD_LINKID,
  RX_SEX_ASSIGNED_AT_BIRTH_LINKID,
} from '../const/special-linkids';

import { isSemaglutideQuestionnaire } from './questionnaire-utils';

export function buildInitialResponse(
  questionnaire: Questionnaire,
  user?: User,
  response?: QuestionnaireResponse,
): QuestionnaireResponse {
  const isSemaglutide = isSemaglutideQuestionnaire(questionnaire, response);

  const newResponse: QuestionnaireResponse = {
    resourceType: 'QuestionnaireResponse',
    questionnaire: getReferenceString(questionnaire),
    item: buildInitialResponseItems(questionnaire.item, user, isSemaglutide),
    status: 'in-progress',
  };

  return newResponse;
}

function buildInitialResponseItems(
  items: QuestionnaireItem[] | undefined,
  user?: User,
  isSemaglutide?: boolean,
): QuestionnaireResponseItem[] {
  return (
    items?.map((item) => buildInitialResponseItem(item, user, isSemaglutide)) ??
    []
  );
}

export function buildInitialResponseItem(
  item: QuestionnaireItem,
  user?: User,
  isSemaglutide?: boolean,
): QuestionnaireResponseItem {
  let initialAnswer = item.initial?.map(buildInitialResponseAnswer) || [];

  // Pre-populate sex-assigned-at-birth for all questionnaires (works recursively for nested items)
  // This ensures the gender question is autofilled even when hidden in Rx questionnaires
  // Only prefill if gender is MALE or FEMALE, as OTHER and UNKNOWN are not valid questionnaire values
  if (item.linkId === RX_SEX_ASSIGNED_AT_BIRTH_LINKID && user?.gender) {
    const normalizedGender = user.gender.toUpperCase();
    if (normalizedGender === 'MALE') {
      initialAnswer = [{ valueString: 'Male' }];
    } else if (normalizedGender === 'FEMALE') {
      initialAnswer = [{ valueString: 'Female' }];
    }
    // For 'OTHER' or 'UNKNOWN', don't prefill - let user answer if question is shown
  }

  // Pre-populate billing-period for semaglutide questionnaires with 1 month subscription
  if (item.linkId === RX_BILLING_PERIOD_LINKID && isSemaglutide) {
    initialAnswer = [{ valueInteger: 1 }];
  }

  return {
    id: generateId(),
    linkId: item.linkId,
    text: item.text,
    item: buildInitialResponseItems(item.item, user, isSemaglutide),
    answer: initialAnswer,
  };
}

let nextId = 1;
function generateId(): string {
  return 'id-' + nextId++;
}

function buildInitialResponseAnswer(
  answer: QuestionnaireItemInitial,
): QuestionnaireResponseItemAnswer {
  // This works because QuestionnaireItemInitial and QuestionnaireResponseItemAnswer
  // have the same properties.
  return { ...answer };
}

export function mergeIndividualItems(
  prevItem: QuestionnaireResponseItem,
  newItem: QuestionnaireResponseItem,
): QuestionnaireResponseItem {
  // Recursively merge the nested items based on their ids.
  const mergedNestedItems = mergeItems(prevItem.item ?? [], newItem.item ?? []);

  return {
    ...newItem,
    item: mergedNestedItems.length > 0 ? mergedNestedItems : undefined,
    answer:
      newItem.answer && newItem.answer.length > 0
        ? newItem.answer
        : prevItem.answer,
  };
}

// This function is used to merge the items from the response into the questionnaire items.
export function mergeItems(
  prevItems: QuestionnaireResponseItem[],
  newItems: QuestionnaireResponseItem[],
): QuestionnaireResponseItem[] {
  const result: QuestionnaireResponseItem[] = [];
  const usedIds = new Set<string>();

  for (const prevItem of prevItems) {
    const itemId = prevItem.id;
    const newItem = newItems.find((item) => item.id === itemId);

    if (newItem) {
      result.push(mergeIndividualItems(prevItem, newItem));
      usedIds.add(newItem.id as string);
    } else {
      result.push(prevItem);
    }
  }

  // Add items from newItems that were not in prevItems.
  for (const newItem of newItems) {
    if (!usedIds.has(newItem.id as string)) {
      result.push(newItem);
    }
  }

  return result;
}

// This function is used to find a response item by its linkId.
// It is used to find the response item for a question in a group.
function findResponseItem(
  linkId: string,
  responseItems: QuestionnaireResponseItem[],
): QuestionnaireResponseItem | undefined {
  for (const item of responseItems) {
    if (item.linkId === linkId) {
      return item;
    }
    if (item.item) {
      const found = findResponseItem(linkId, item.item);
      if (found) {
        return found;
      }
    }
  }
  return undefined;
}

// This function is used to merge the answers from the response items into the questionnaire items.
export function mergeResponseItems(
  questionnaireItems: QuestionnaireItem[],
  responseItems: QuestionnaireResponseItem[],
): QuestionnaireItem[] {
  return questionnaireItems.map((item) => {
    const responseItem = findResponseItem(item.linkId, responseItems);
    const mergedItem = { ...item };

    if (responseItem?.answer && responseItem.answer.length > 0) {
      mergedItem.initial = responseItem.answer;
    }

    if (item.item) {
      mergedItem.item = mergeResponseItems(item.item, responseItems);
    }

    return mergedItem;
  });
}
