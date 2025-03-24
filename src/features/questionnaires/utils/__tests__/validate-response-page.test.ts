import { Questionnaire, QuestionnaireResponseItem } from '@medplum/fhirtypes';

import { validateQuestionnairePageErrors } from '@/features/questionnaires/utils/validate-response-page';

describe('validateQuestionnairePageErrors', () => {
  // Test 1: Page not found in questionnaire.
  it('should return an error (with the page linkId) if the specified page is not found', () => {
    const questionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'active',
      item: [{ linkId: 'PAGE1', text: 'Page 1', type: 'group', item: [] }],
    };
    const responseItems: QuestionnaireResponseItem[] = [
      { linkId: 'PAGE1', item: [] },
    ];
    const errors = validateQuestionnairePageErrors(
      questionnaire,
      responseItems,
      'NON_EXISTENT',
    );
    expect(errors).toEqual(['NON_EXISTENT']);
  });

  // Test 2: Page exists but has no items.
  it('should return no errors if the page exists but has no items', () => {
    const questionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'active',
      item: [{ linkId: 'PAGE1', text: 'Page 1', type: 'group', item: [] }],
    };
    const responseItems: QuestionnaireResponseItem[] = [
      { linkId: 'PAGE1', item: [] },
    ];
    const errors = validateQuestionnairePageErrors(
      questionnaire,
      responseItems,
      'PAGE1',
    );
    expect(errors).toEqual([]);
  });

  // Test 3: A required top‑level item is missing entirely from the response.
  it('should return an error for a missing required top-level item', () => {
    const questionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'active',
      item: [
        {
          linkId: 'PAGE1',
          text: 'Page 1',
          type: 'group',
          item: [
            {
              linkId: 'Q1',
              text: 'Required Q1',
              type: 'question',
              required: true,
            },
            {
              linkId: 'Q2',
              text: 'Optional Q2',
              type: 'question',
              required: false,
            },
          ],
        },
      ],
    };

    // Only Q2 is provided.
    const responseItems: QuestionnaireResponseItem[] = [
      {
        linkId: 'PAGE1',
        item: [{ linkId: 'Q2', answer: [{ valueString: 'Answer for Q2' }] }],
      },
    ];

    const errors = validateQuestionnairePageErrors(
      questionnaire,
      responseItems,
      'PAGE1',
    );
    expect(errors).toEqual(['Q1']);
  });

  // Test 4: A required item is present but has an empty answer array.
  it('should return an error for a required item with an empty answer array', () => {
    const questionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'active',
      item: [
        {
          linkId: 'PAGE1',
          text: 'Page 1',
          type: 'group',
          item: [
            {
              linkId: 'Q1',
              text: 'Required Q1',
              type: 'question',
              required: true,
            },
          ],
        },
      ],
    };

    const responseItems: QuestionnaireResponseItem[] = [
      {
        linkId: 'PAGE1',
        item: [{ linkId: 'Q1', answer: [] }],
      },
    ];

    const errors = validateQuestionnairePageErrors(
      questionnaire,
      responseItems,
      'PAGE1',
    );
    expect(errors).toEqual(['Q1']);
  });

  // Test 5: A required item is provided with a valid answer.
  it('should not return an error when a required item has a valid answer', () => {
    const questionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'active',
      item: [
        {
          linkId: 'PAGE1',
          text: 'Page 1',
          type: 'group',
          item: [
            {
              linkId: 'Q1',
              text: 'Required Q1',
              type: 'question',
              required: true,
            },
          ],
        },
      ],
    };

    const responseItems: QuestionnaireResponseItem[] = [
      {
        linkId: 'PAGE1',
        item: [{ linkId: 'Q1', answer: [{ valueString: 'Valid answer' }] }],
      },
    ];

    const errors = validateQuestionnairePageErrors(
      questionnaire,
      responseItems,
      'PAGE1',
    );
    expect(errors).toEqual([]);
  });

  // Test 7: Optional items missing should not produce an error.
  it('should not return an error for optional items that are missing', () => {
    const questionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'active',
      item: [
        {
          linkId: 'PAGE1',
          text: 'Page 1',
          type: 'group',
          item: [
            {
              linkId: 'Q1',
              text: 'Optional Q1',
              type: 'question',
              required: false,
            },
          ],
        },
      ],
    };

    // Q1 is missing.
    const responseItems: QuestionnaireResponseItem[] = [
      {
        linkId: 'PAGE1',
        item: [],
      },
    ];

    const errors = validateQuestionnairePageErrors(
      questionnaire,
      responseItems,
      'PAGE1',
    );
    expect(errors).toEqual([]);
  });

  // Test 8: A required nested item within an optional group is missing.
  it('should return an error for a missing required nested item even if the parent group is optional', () => {
    const questionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'active',
      item: [
        {
          linkId: 'PAGE1',
          text: 'Page 1',
          type: 'group',
          item: [
            {
              linkId: 'GROUP1',
              text: 'Optional Group',
              type: 'group',
              required: false,
              item: [
                {
                  linkId: 'Q1-1',
                  text: 'Required nested in optional group',
                  type: 'question',
                  required: true,
                },
              ],
            },
          ],
        },
      ],
    };

    // GROUP1 is provided but its required child Q1-1 is missing.
    const responseItems: QuestionnaireResponseItem[] = [
      {
        linkId: 'PAGE1',
        item: [
          {
            linkId: 'GROUP1',
            item: [],
          },
        ],
      },
    ];

    const errors = validateQuestionnairePageErrors(
      questionnaire,
      responseItems,
      'PAGE1',
    );
    expect(errors).toEqual(['Q1-1']);
  });

  // Test 10: Extra response items that are not defined in the questionnaire should be ignored.
  it('should ignore extra response items not defined in the questionnaire', () => {
    const questionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'active',
      item: [
        {
          linkId: 'PAGE1',
          text: 'Page 1',
          type: 'group',
          item: [
            {
              linkId: 'Q1',
              text: 'Required Q1',
              type: 'question',
              required: true,
            },
          ],
        },
      ],
    };

    const responseItems: QuestionnaireResponseItem[] = [
      {
        linkId: 'PAGE1',
        item: [
          { linkId: 'Q1', answer: [{ valueString: 'Answer for Q1' }] },
          // Extra response item that does not exist in the questionnaire.
          { linkId: 'Q-extra', answer: [{ valueString: 'Extra answer' }] },
        ],
      },
      // An additional extraneous response page.
      { linkId: 'NonMatching', answer: [{ valueString: 'Not relevant' }] },
    ];

    const errors = validateQuestionnairePageErrors(
      questionnaire,
      responseItems,
      'PAGE1',
    );
    expect(errors).toEqual([]);
  });
});
