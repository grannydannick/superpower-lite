import type { QuestionnaireResponseItem } from '@medplum/fhirtypes';
import { act, renderHook } from '@testing-library/react';
import { vi } from 'vitest';

import { useQuestionnaireResponseController } from '../use-questionnaire-response-controller';

const useQuestionnaireMock = vi.fn();
const useQuestionnaireResponseMock = vi.fn();
const createQuestionnaireResponseMock = vi.fn();
const updateQuestionnaireResponseMock = vi.fn();

vi.mock('@/features/questionnaires/api/questionnaire', () => ({
  useQuestionnaire: (...args: unknown[]) => useQuestionnaireMock(...args),
}));

vi.mock('@/features/questionnaires/api/questionnaire-response', () => ({
  useQuestionnaireResponse: (...args: unknown[]) =>
    useQuestionnaireResponseMock(...args),
  useCreateQuestionnaireResponse: () => ({
    mutateAsync: createQuestionnaireResponseMock,
  }),
  useUpdateQuestionnaireResponse: () => ({
    mutate: updateQuestionnaireResponseMock,
  }),
}));

const buildItem = (
  linkId: string,
  answer?: Array<{ valueString: string }>,
): QuestionnaireResponseItem =>
  ({
    linkId,
    answer,
  }) as QuestionnaireResponseItem;

const normalizeAnsweredItems = (items: QuestionnaireResponseItem[]) =>
  items.filter((item) => item.answer && item.answer.length > 0);

beforeEach(() => {
  vi.clearAllMocks();
  useQuestionnaireMock.mockReturnValue({
    data: { questionnaire: { id: 'questionnaire-id' } },
    isLoading: false,
    isPending: false,
  });
  useQuestionnaireResponseMock.mockReturnValue({
    data: { questionnaireResponse: null },
    isLoading: false,
  });
  createQuestionnaireResponseMock.mockResolvedValue({ id: 'created-id' });
});

test('treats pending questionnaire query as loading (react-query v5 enabled gap)', () => {
  useQuestionnaireResponseMock.mockReturnValue({
    data: { questionnaireResponse: null },
    isLoading: false,
  });

  useQuestionnaireMock.mockReturnValue({
    data: undefined,
    isLoading: false,
    isPending: true,
  });

  const { result } = renderHook(() =>
    useQuestionnaireResponseController({
      questionnaireName: 'demo',
      statuses: ['in-progress'],
    }),
  );

  expect(result.current.isLoading).toBe(true);
});

test('save creates response by default', async () => {
  const { result } = renderHook(() =>
    useQuestionnaireResponseController({
      questionnaireName: 'demo',
      statuses: ['in-progress'],
    }),
  );

  await act(async () => {
    await result.current.save([buildItem('answered', [{ valueString: 'ok' }])]);
  });

  expect(createQuestionnaireResponseMock).toHaveBeenCalledWith({
    questionnaire: 'questionnaire-id',
    item: [buildItem('answered', [{ valueString: 'ok' }])],
    status: 'in-progress',
  });
});

test('save normalizes items before create', async () => {
  const { result } = renderHook(() =>
    useQuestionnaireResponseController({
      questionnaireName: 'demo',
      statuses: ['in-progress'],
      normalizeItems: normalizeAnsweredItems,
    }),
  );

  await act(async () => {
    await result.current.save([
      buildItem('answered', [{ valueString: 'ok' }]),
      buildItem('empty'),
    ]);
  });

  expect(createQuestionnaireResponseMock).toHaveBeenCalledWith({
    questionnaire: 'questionnaire-id',
    item: [buildItem('answered', [{ valueString: 'ok' }])],
    status: 'in-progress',
  });
});

test('save skips create when normalized items empty', async () => {
  const { result } = renderHook(() =>
    useQuestionnaireResponseController({
      questionnaireName: 'demo',
      statuses: ['in-progress'],
      normalizeItems: () => [],
    }),
  );

  await act(async () => {
    await result.current.save([buildItem('empty')]);
  });

  expect(createQuestionnaireResponseMock).not.toHaveBeenCalled();
});

test('submit normalizes items before update', async () => {
  useQuestionnaireResponseMock.mockReturnValue({
    data: {
      questionnaireResponse: {
        id: 'response-id',
        status: 'in-progress',
      },
    },
    isLoading: false,
  });

  const { result } = renderHook(() =>
    useQuestionnaireResponseController({
      questionnaireName: 'demo',
      statuses: ['in-progress'],
      normalizeItems: normalizeAnsweredItems,
    }),
  );

  await act(async () => {
    await result.current.submit([
      buildItem('answered', [{ valueString: 'ok' }]),
      buildItem('empty'),
    ]);
  });

  expect(updateQuestionnaireResponseMock).toHaveBeenCalledWith({
    id: 'response-id',
    data: {
      item: [buildItem('answered', [{ valueString: 'ok' }])],
      status: 'completed',
    },
    invalidateIdentifiers: ['demo'],
  });
});

test('submit skips create and onSuccess when normalized items empty', async () => {
  const onSuccess = vi.fn();

  const { result } = renderHook(() =>
    useQuestionnaireResponseController({
      questionnaireName: 'demo',
      statuses: ['in-progress'],
      normalizeItems: () => [],
    }),
  );

  await act(async () => {
    await result.current.submit([buildItem('empty')], { onSuccess });
  });

  expect(createQuestionnaireResponseMock).not.toHaveBeenCalled();
  expect(onSuccess).not.toHaveBeenCalled();
});
