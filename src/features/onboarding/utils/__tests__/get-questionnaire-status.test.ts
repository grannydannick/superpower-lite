import type {
  ListQuestionnaireResponsesResponse,
  QuestionnaireResponseStatus,
} from '@/features/questionnaires/api/questionnaire-response';

import {
  buildQuestionnaireStatusMap,
  getQuestionnaireStatus,
} from '../get-questionnaire-status';

const buildResponse = (
  name: string,
  status: QuestionnaireResponseStatus,
  overrides?: Partial<ListQuestionnaireResponsesResponse[number]>,
): ListQuestionnaireResponsesResponse[number] => ({
  resourceType: 'QuestionnaireResponse',
  status,
  identifier: {
    system: 'https://superpower.com/fhir/CodeSystem/questionnaire-type',
    value: name,
  },
  ...overrides,
});

describe('getQuestionnaireStatus', () => {
  it('matches by identifier value when questionnaire is a UUID', () => {
    const responses = [
      buildResponse('onboarding-primer', 'completed', {
        questionnaire: '1f1efa93-93ee-42b3-b14b-19aad49e5b78',
      }),
    ];

    const statusMap = buildQuestionnaireStatusMap(responses);
    expect(getQuestionnaireStatus(statusMap, 'onboarding-primer')).toBe(
      'completed',
    );
  });

  it('prefers completed when multiple responses exist', () => {
    const responses = [
      buildResponse('onboarding-primer', 'in-progress'),
      buildResponse('onboarding-primer', 'completed'),
      buildResponse('onboarding-primer', 'stopped'),
    ];

    const statusMap = buildQuestionnaireStatusMap(responses);
    expect(getQuestionnaireStatus(statusMap, 'onboarding-primer')).toBe(
      'completed',
    );
  });

  it('returns in-progress when no completed responses exist', () => {
    const responses = [
      buildResponse('onboarding-primer', 'stopped'),
      buildResponse('onboarding-primer', 'in-progress'),
    ];

    const statusMap = buildQuestionnaireStatusMap(responses);
    expect(getQuestionnaireStatus(statusMap, 'onboarding-primer')).toBe(
      'in-progress',
    );
  });

  it('returns undefined when no matches exist', () => {
    const responses = [
      buildResponse('onboarding-medical-history', 'completed'),
    ];

    const statusMap = buildQuestionnaireStatusMap(responses);
    expect(getQuestionnaireStatus(statusMap, 'onboarding-primer')).toBe(
      undefined,
    );
  });
});
