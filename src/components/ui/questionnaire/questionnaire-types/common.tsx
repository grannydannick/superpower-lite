import { TypedValue, getTypedPropertyValue, formatCoding } from '@medplum/core';
import { QuestionnaireResponseItem } from '@medplum/fhirtypes';

/**
 * Get the typed value from a questionnaire answer
 */
export function getItemValue(answer: any): TypedValue {
  return getTypedPropertyValue(
    { type: 'QuestionnaireItemAnswer', value: answer },
    'value',
  ) as TypedValue;
}

/**
 * Get the current answer from a response
 */
export function getCurrentAnswer(
  response: QuestionnaireResponseItem,
  index: number = 0,
): TypedValue {
  const results = response.answer;
  return getItemValue(results?.[index] ?? {});
}

/**
 * Get multi-select answers as a string array
 */
export function getCurrentMultiSelectAnswer(
  response: QuestionnaireResponseItem,
): string[] {
  const results = response.answer;
  if (!results) {
    return [];
  }
  const typedValues = results.map((a) => getItemValue(a));
  return typedValues.map((type) => formatCoding(type?.value) || type?.value);
}

/**
 * Convert TypedValue to string representation
 */
export function typedValueToString(
  typedValue: TypedValue | undefined,
): string | undefined {
  if (!typedValue) {
    return undefined;
  }
  if (typedValue.type === 'CodeableConcept') {
    return formatCodeableConcept(typedValue.value);
  }
  if (typedValue.type === 'Coding') {
    return formatCoding(typedValue.value);
  }
  if (typedValue.type === 'Reference') {
    return formatReferenceString(typedValue);
  }
  return typedValue.value.toString();
}

/**
 * Format a CodeableConcept to a string
 */
export function formatCodeableConcept(concept: any): string {
  if (!concept) {
    return '';
  }
  if (concept.text) {
    return concept.text;
  }
  if (concept.coding && concept.coding.length > 0) {
    return formatCoding(concept.coding[0]);
  }
  return JSON.stringify(concept);
}

/**
 * Format a Reference to a string
 */
export function formatReferenceString(reference: any): string {
  if (!reference || !reference.value) {
    return '';
  }
  const value = reference.value;
  if (value.display) {
    return value.display;
  }
  if (value.reference) {
    return value.reference;
  }
  return JSON.stringify(value);
}
