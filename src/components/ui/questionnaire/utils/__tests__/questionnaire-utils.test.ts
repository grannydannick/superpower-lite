import { TypedValue } from '@medplum/core';
import { Questionnaire, QuestionnaireItem } from '@medplum/fhirtypes';

import {
  QuestionnaireItemType,
  isMultipleChoice,
  getNewMultiSelectValues,
  formatReferenceString,
  getNumberOfPages,
  shouldAutoAdvanceMultipleChoice,
} from '../questionnaire-utils';

describe('questionnaire-utils', () => {
  describe('QuestionnaireItemType', () => {
    it('should define all the expected questionnaire item types', () => {
      expect(QuestionnaireItemType.group).toBe('group');
      expect(QuestionnaireItemType.display).toBe('display');
      expect(QuestionnaireItemType.string).toBe('string');
      expect(QuestionnaireItemType.choice).toBe('choice');
      expect(QuestionnaireItemType.boolean).toBe('boolean');
    });
  });

  describe('isMultipleChoice', () => {
    it('should return true for items with drop-down itemControl extension', () => {
      const item: QuestionnaireItem = {
        linkId: 'q1',
        text: 'Question 1',
        type: 'choice',
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
            valueCodeableConcept: {
              coding: [
                {
                  system: 'http://hl7.org/fhir/questionnaire-item-control',
                  code: 'drop-down',
                  display: 'Drop down',
                },
              ],
            },
          },
        ],
      };

      expect(isMultipleChoice(item)).toBe(true);
    });

    it('should return false for items without itemControl extension', () => {
      const item: QuestionnaireItem = {
        linkId: 'q1',
        text: 'Question 1',
        type: 'choice',
      };

      expect(isMultipleChoice(item)).toBe(false);
    });

    it('should return false for items with non-dropdown itemControl', () => {
      const item: QuestionnaireItem = {
        linkId: 'q1',
        text: 'Question 1',
        type: 'choice',
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
            valueCodeableConcept: {
              coding: [
                {
                  system: 'http://hl7.org/fhir/questionnaire-item-control',
                  code: 'radio-button',
                  display: 'Radio Button',
                },
              ],
            },
          },
        ],
      };

      expect(isMultipleChoice(item)).toBe(false);
    });
  });

  describe('getNewMultiSelectValues', () => {
    it('should convert selected options to answer items', () => {
      const item: QuestionnaireItem = {
        linkId: 'q1',
        text: 'Question 1',
        type: 'choice',
        answerOption: [
          {
            valueCoding: {
              system: 'http://example.org',
              code: 'option1',
              display: 'Option 1',
            },
          },
          {
            valueCoding: {
              system: 'http://example.org',
              code: 'option2',
              display: 'Option 2',
            },
          },
        ],
      };

      const selected = ['Option 1'];
      const result = getNewMultiSelectValues(selected, 'valueCoding', item);

      expect(result).toHaveLength(1);
      expect(result[0].valueCoding).toEqual({
        system: 'http://example.org',
        code: 'option1',
        display: 'Option 1',
      });
    });

    it('should handle multiple selected options', () => {
      const item: QuestionnaireItem = {
        linkId: 'q1',
        text: 'Question 1',
        type: 'choice',
        answerOption: [
          {
            valueString: 'Option 1',
          },
          {
            valueString: 'Option 2',
          },
          {
            valueString: 'Option 3',
          },
        ],
      };

      const selected = ['Option 1', 'Option 3'];
      const result = getNewMultiSelectValues(selected, 'valueString', item);

      expect(result).toHaveLength(2);
      expect(result[0].valueString).toBe('Option 1');
      expect(result[1].valueString).toBe('Option 3');
    });
  });

  describe('shouldAutoAdvanceMultipleChoice', () => {
    it('returns false when exclusive option is selected', () => {
      expect(shouldAutoAdvanceMultipleChoice(1, true, false)).toBe(false);
    });

    it('returns true for single non-exclusive selection', () => {
      expect(shouldAutoAdvanceMultipleChoice(1, false, false)).toBe(true);
    });

    it('returns false for repeatable items', () => {
      expect(shouldAutoAdvanceMultipleChoice(1, false, true)).toBe(false);
    });

    it('returns false when more than one answer is selected', () => {
      expect(shouldAutoAdvanceMultipleChoice(2, false, false)).toBe(false);
    });
  });

  describe('formatReferenceString', () => {
    it('should return display if available', () => {
      const typedValue: TypedValue = {
        type: 'Reference',
        value: {
          reference: 'Patient/123',
          display: 'John Doe',
        },
      };

      expect(formatReferenceString(typedValue)).toBe('John Doe');
    });

    it('should return reference if display is not available', () => {
      const typedValue: TypedValue = {
        type: 'Reference',
        value: {
          reference: 'Patient/123',
        },
      };

      expect(formatReferenceString(typedValue)).toBe('Patient/123');
    });

    it('should stringify value if neither display nor reference is available', () => {
      const typedValue: TypedValue = {
        type: 'Reference',
        value: {
          id: '123',
        },
      };

      // The exact string representation may vary, so just check it contains the id
      expect(formatReferenceString(typedValue)).toContain('123');
    });
  });

  describe('getNumberOfPages', () => {
    it('should return 1 for questionnaires without page extension', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'q1',
            text: 'Question 1',
            type: 'string',
          },
        ],
      };

      expect(getNumberOfPages(questionnaire)).toBe(1);
    });

    it('should return the number of top-level items for questionnaires with page extension', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'page1',
            text: 'Page 1',
            type: 'group',
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
                valueCodeableConcept: {
                  coding: [
                    {
                      system: 'http://hl7.org/fhir/questionnaire-item-control',
                      code: 'page',
                    },
                  ],
                },
              },
            ],
          },
          {
            linkId: 'page2',
            text: 'Page 2',
            type: 'group',
          },
          {
            linkId: 'page3',
            text: 'Page 3',
            type: 'group',
          },
        ],
      };

      expect(getNumberOfPages(questionnaire)).toBe(3);
    });

    it('should return 1 for empty questionnaires', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
      };

      expect(getNumberOfPages(questionnaire)).toBe(1);
    });
  });
});
