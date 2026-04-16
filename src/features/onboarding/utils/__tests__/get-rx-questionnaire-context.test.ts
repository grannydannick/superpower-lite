import { describe, expect, it } from 'vitest';

import { getRxQuestionnaireContext } from '../get-rx-questionnaire-context';

describe('getRxQuestionnaireContext', () => {
  it('returns required for an in-progress rx assessment', () => {
    expect(
      getRxQuestionnaireContext([
        {
          identifier: 'rx-assessment-metformin',
          status: 'in_progress',
        },
      ]),
    ).toEqual({
      status: 'required',
      questionnaireIdentifier: 'rx-assessment-metformin',
    });
  });

  it('ignores symptom trackers and returns completed when only rx assessments are done', () => {
    expect(
      getRxQuestionnaireContext([
        {
          identifier: 'rx-assessment-metformin-symptom-tracker',
          status: 'in_progress',
        },
        {
          identifier: 'rx-assessment-metformin',
          status: 'completed',
        },
      ]),
    ).toEqual({
      status: 'completed',
    });
  });
});
