import {
  TypedValue,
  formatCoding,
  getExtension,
  getTypedPropertyValue,
  stringify,
} from '@medplum/core';
import {
  Questionnaire,
  QuestionnaireItem,
  QuestionnaireItemAnswerOption,
  QuestionnaireResponse,
  QuestionnaireResponseItemAnswer,
} from '@medplum/fhirtypes';

import { User } from '@/types/api';

import {
  RX_ASSESSMENTS,
  RxQuestionnaireName,
} from '../../../../const/questionnaire';
import {
  RX_IDENTITY_VERIFICATION_LINKID,
  RX_SEX_ASSIGNED_AT_BIRTH_LINKID,
} from '../const/special-linkids';

import { isIdentityVerificationExpired } from './questionnaire-identity-utils';

export const FRONTDOOR_EXPERIMENT_SYSTEM =
  'https://superpower.com/fhir/experiment';
export const GLP_FRONTDOOR_EXPERIMENT_VALUE = 'glp-frontdoor-experiment';

export function isFrontDoorExperiment(
  response?: QuestionnaireResponse,
): boolean {
  return (
    response?.identifier?.system === FRONTDOOR_EXPERIMENT_SYSTEM &&
    response?.identifier?.value === GLP_FRONTDOOR_EXPERIMENT_VALUE
  );
}

export function isSemaglutideByName(questionnaire: Questionnaire): boolean {
  return questionnaire.name?.toLowerCase().includes('semaglutide') ?? false;
}

// Used to default billing-period to 1 month (semaglutide pricing); frontdoor is also semaglutide
export function isSemaglutideQuestionnaire(
  questionnaire: Questionnaire,
  response?: QuestionnaireResponse,
): boolean {
  return isSemaglutideByName(questionnaire) || isFrontDoorExperiment(response);
}

export enum QuestionnaireItemType {
  group = 'group',
  display = 'display',
  question = 'question',
  boolean = 'boolean',
  decimal = 'decimal',
  integer = 'integer',
  date = 'date',
  dateTime = 'dateTime',
  time = 'time',
  string = 'string',
  text = 'text',
  url = 'url',
  choice = 'choice',
  openChoice = 'open-choice',
  attachment = 'attachment',
  reference = 'reference',
  quantity = 'quantity',
}

/**
 * Checks if a questionnaire is an Rx questionnaire by verifying if its name exists in the RX_ASSESSMENTS list.
 */
export function isRxQuestionnaire(questionnaire: Questionnaire): boolean {
  return RX_ASSESSMENTS.includes(questionnaire.name as RxQuestionnaireName);
}

/**
 * Checks if a question should be skipped because it's the gender question in an Rx questionnaire.
 * For Rx questionnaires, the gender question is autofilled, so it should not be shown to the user.
 */
export function shouldSkipGenderQuestion(
  item: QuestionnaireItem,
  questionnaire: Questionnaire,
  user?: User,
): boolean {
  return (
    isRxQuestionnaire(questionnaire) &&
    item.linkId === RX_SEX_ASSIGNED_AT_BIRTH_LINKID &&
    !!user?.gender
  );
}

/**
 * Checks if a question should be skipped because it's the identity verification question
 * and the user already has a verified identity that hasn't expired.
 * For Rx questionnaires, if the user's identity is already verified and not expired,
 * they should not be shown the identity verification question.
 */
export function shouldSkipIdentityQuestion(
  item: QuestionnaireItem,
  questionnaire: Questionnaire,
  user?: User,
): boolean {
  if (
    !isRxQuestionnaire(questionnaire) ||
    item.linkId !== RX_IDENTITY_VERIFICATION_LINKID
  ) {
    return false;
  }

  // Check if user is verified
  const isVerified = user?.identityVerificationStatus === 'VERIFIED';
  if (!isVerified || !user?.identityUpdatedTime) {
    return false;
  }

  // Skip if verified and not expired
  return !isIdentityVerificationExpired(user?.identityUpdatedTime);
}

/**
 * Checks if a question should be skipped for front-door experiment users or semaglutide questionnaires.
 * Front-door users already paid, so we skip billing-period and payment questions.
 * For semaglutide questionnaires, billing-period is auto-set to 1 month, so we skip it.
 */
export function shouldSkipFrontDoorQuestion(
  item: QuestionnaireItem,
  questionnaire: Questionnaire,
  response?: QuestionnaireResponse,
): boolean {
  // For frontdoor experiments, skip both billing-period and payment
  if (isFrontDoorExperiment(response)) {
    return (
      item.linkId === 'consent-payment.billing-period' ||
      item.linkId === 'consent-payment.payment'
    );
  }

  // For all semaglutide questionnaires, skip billing-period (auto-set to 1 month)
  if (isSemaglutideByName(questionnaire)) {
    return item.linkId === 'consent-payment.billing-period';
  }

  return false;
}

/**
 * TODO: ideally this logic lives on the server side, but FHIR QR native components is blocking this
 * Consolidated function to check if a question should be skipped.
 * Calls all individual skip functions (gender, identity, etc.) and returns true
 * if any of them indicate the question should be skipped.
 */
export function shouldSkipQuestion(
  item: QuestionnaireItem,
  questionnaire: Questionnaire,
  user?: User,
  response?: QuestionnaireResponse,
): boolean {
  return (
    shouldSkipGenderQuestion(item, questionnaire, user) ||
    shouldSkipIdentityQuestion(item, questionnaire, user) ||
    shouldSkipFrontDoorQuestion(item, questionnaire, response)
  );
}

export function isMultipleChoice(item: QuestionnaireItem): boolean {
  return !!item.extension?.some(
    (e) =>
      e.url ===
        'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl' &&
      e.valueCodeableConcept?.coding?.[0]?.code === 'drop-down',
  );
}

/**
 * This function is used to get the new multi select values from the selected options.
 * It takes the selected options, the property name of the selected options, and the item.
 * It returns an array of objects with the property name and the option value.
 * The property name is the name of the property on the option that contains the value.
 * The option value is the value of the option.
 */
export function getNewMultiSelectValues(
  selected: string[],
  propertyName: string,
  item: QuestionnaireItem,
): QuestionnaireResponseItemAnswer[] {
  return selected.map((o) => {
    const option = item.answerOption?.find(
      (option) =>
        formatCoding(option.valueCoding) === o ||
        option[propertyName as keyof QuestionnaireItemAnswerOption] === o,
    );
    const optionValue = getTypedPropertyValue(
      { type: 'QuestionnaireItemAnswerOption', value: option },
      'value',
    ) as TypedValue;
    return { [propertyName]: optionValue?.value };
  });
}

/**
 * This function is used to format the reference string.
 * It takes a typed value and returns the display or reference.
 */
export function formatReferenceString(typedValue: TypedValue): string {
  return (
    typedValue.value.display ||
    typedValue.value.reference ||
    stringify(typedValue.value)
  );
}

/**
 * Returns the number of pages in the questionnaire.
 *
 * By default, a questionnaire is represented as a simple single page questionnaire,
 * so the default return value is 1.
 *
 * If the questionnaire has a page extension on the first item, then the number of pages
 * is the number of top level items in the questionnaire.
 *
 * @param questionnaire - The questionnaire to get the number of pages for.
 * @returns The number of pages in the questionnaire. Default is 1.
 */
export function getNumberOfPages(questionnaire: Questionnaire): number {
  const firstItem = questionnaire?.item?.[0];
  if (firstItem) {
    const extension = getExtension(
      firstItem,
      'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
    );
    if (extension?.valueCodeableConcept?.coding?.[0]?.code === 'page') {
      return (questionnaire.item as QuestionnaireItem[]).length;
    }
  }
  return 1;
}

function getNumericExtensionValue(extension: any): number | undefined {
  if (!extension) {
    return undefined;
  }
  if (typeof extension.valueDecimal === 'number') {
    return extension.valueDecimal;
  }
  if (typeof extension.valueInteger === 'number') {
    return extension.valueInteger;
  }
  if (typeof extension.valueQuantity?.value === 'number') {
    return extension.valueQuantity.value;
  }
  return undefined;
}

export function getNumericBounds(item: QuestionnaireItem): {
  min?: number;
  max?: number;
} {
  const extensions = item.extension ?? [];

  const minExtension = extensions.find(
    (extension) =>
      extension.url === 'http://hl7.org/fhir/StructureDefinition/minValue',
  );
  const maxExtension = extensions.find(
    (extension) =>
      extension.url === 'http://hl7.org/fhir/StructureDefinition/maxValue',
  );

  const min = getNumericExtensionValue(minExtension);
  const max = getNumericExtensionValue(maxExtension);

  return {
    ...(min !== undefined ? { min } : null),
    ...(max !== undefined ? { max } : null),
  };
}
