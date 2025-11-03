/*
 * Fellow devs: please define constant custom system URLs below for any ones that enable custom form behavior.
 */

// Used to mark an option as exclusive.
// e.g "None of the above" in a multiple choice question disables other options except the selected one.
export const OPTION_EXCLUSIVE_EXTENSION_URL =
  'http://hl7.org/fhir/StructureDefinition/questionnaire-optionExclusive';

// Used to display a description for the questionnaire item.
export const SUPERPOWER_QUESTIONNAIRE_DESCRIPTION_EXTENSION_URL =
  'https://superpower.com/fhir/StructureDefinition/questionnaire-description';

// Used to indicate multiple choice questions.
export const QUESTIONNAIRE_ITEM_CONTROL_EXTENSION_URL =
  'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl';
