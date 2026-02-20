import type {
  ListQuestionnaireResponsesResponse,
  QuestionnaireResponseStatus,
} from '@/features/questionnaires/api/questionnaire-response';

type QuestionnaireResponseLike = Pick<
  ListQuestionnaireResponsesResponse[number],
  'identifier' | 'status'
>;

const statusPriority: Partial<Record<QuestionnaireResponseStatus, number>> = {
  completed: 3,
  'in-progress': 2,
  stopped: 1,
  amended: 0,
  'entered-in-error': 0,
};

const getQuestionnaireNameFromResponse = (
  response: QuestionnaireResponseLike,
): string | undefined => response.identifier?.value;

export const buildQuestionnaireStatusMap = (
  responses: ListQuestionnaireResponsesResponse | undefined,
): Map<string, QuestionnaireResponseStatus> => {
  const map = new Map<string, QuestionnaireResponseStatus>();
  if (!responses || responses.length === 0) return map;

  for (const response of responses) {
    const name = getQuestionnaireNameFromResponse(response);
    if (!name || !response.status) continue;

    const current = map.get(name);
    const responsePriority = statusPriority[response.status] ?? 0;
    const currentPriority = current ? (statusPriority[current] ?? 0) : -1;
    if (responsePriority > currentPriority) {
      map.set(name, response.status);
    }
  }

  return map;
};

export const getQuestionnaireStatus = (
  statusMap: Map<string, QuestionnaireResponseStatus>,
  questionnaireName: string,
): QuestionnaireResponseStatus | undefined => statusMap.get(questionnaireName);
