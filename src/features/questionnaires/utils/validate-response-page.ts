import {
  Questionnaire,
  QuestionnaireResponseItem,
  QuestionnaireItem,
} from '@medplum/fhirtypes';

import { isQuestionEnabled } from '@/features/questionnaires/utils/questionnaire';

/**
 * Validates the required items on a specific page (group) in a FHIR Questionnaire.
 * Returns an array of linkIds that are missing required answers.
 *
 * @param questionnaire - The full Questionnaire resource.
 * @param responseItems - The top-level array of QuestionnaireResponseItem from the QuestionnaireResponse.
 * @param pageLinkId - The linkId of the page (group) to validate (e.g., "GR1").
 * @returns An array of linkIds for items that are missing required answers.
 */
export const validateQuestionnairePageErrors = (
  questionnaire: Questionnaire,
  responseItems: QuestionnaireResponseItem[],
  pageLinkId: string,
): string[] => {
  const errors: string[] = [];

  // find the specified page in the questionnaire.
  const page = questionnaire.item?.find((item) => item.linkId === pageLinkId);
  if (!page) {
    errors.push(pageLinkId);
    return errors;
  }

  // if page validation should not be enabled
  if (!isQuestionEnabled(page, responseItems)) {
    return [];
  }

  // find the corresponding response page (if present).
  const responsePage = responseItems.find((item) => item.linkId === pageLinkId);

  // validate all items within this page.
  if (page.item && page.item.length > 0) {
    validateItems(page.item, responsePage?.item || [], errors);
  }

  return errors;
};

/**
 * Recursively validates questionnaire items against response items.
 * If a required item is missing a response or answer, its linkId is added to the errors array.
 *
 * @param qItems - An array of QuestionnaireItem.
 * @param rItems - An array of corresponding QuestionnaireResponseItem.
 * @param errors - The accumulating array of linkIds with errors.
 */
const validateItems = (
  qItems: QuestionnaireItem[],
  rItems: QuestionnaireResponseItem[],
  errors: string[],
): void => {
  qItems.forEach((qItem) => {
    if (!isQuestionEnabled(qItem, rItems)) {
      return;
    }

    // Find the matching response item by linkId.
    const rItem = rItems.find((item) => item.linkId === qItem.linkId);

    // If the item is required, ensure a response and answer exist.
    if (qItem.required) {
      if (!rItem || !rItem.answer || rItem.answer.length === 0) {
        errors.push(qItem.linkId);
      }
    }

    // Recursively validate nested items (if any).
    if (qItem.item && qItem.item.length > 0) {
      validateItems(qItem.item, rItem?.item || [], errors);
    }
  });
};
