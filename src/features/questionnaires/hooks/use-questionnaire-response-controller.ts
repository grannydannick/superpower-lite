import { QuestionnaireResponseItem } from '@medplum/fhirtypes';
import { keepPreviousData } from '@tanstack/react-query';
import { useRef, useState } from 'react';

import { useQuestionnaire } from '@/features/questionnaires/api/questionnaire';
import {
  QuestionnaireResponseStatus,
  useCreateQuestionnaireResponse,
  useQuestionnaireResponse,
  useUpdateQuestionnaireResponse,
} from '@/features/questionnaires/api/questionnaire-response';
import type { CreateQuestionnaireResponseBody } from '@/features/questionnaires/api/questionnaire-response';

type SubmitOptions = {
  onSuccess?: () => void;
};

type NormalizeItems = (
  items: QuestionnaireResponseItem[],
) => QuestionnaireResponseItem[];

type UseQuestionnaireResponseControllerOptions = {
  questionnaireName: string;
  statuses: QuestionnaireResponseStatus[];
  normalizeItems?: NormalizeItems;
};

export const useQuestionnaireResponseController = ({
  questionnaireName,
  statuses,
  normalizeItems,
}: UseQuestionnaireResponseControllerOptions) => {
  const responseQuery = useQuestionnaireResponse({
    identifier: questionnaireName,
    statuses,
    queryConfig: { enabled: !!questionnaireName },
  });

  const responseSettled = !responseQuery.isLoading;
  const response = responseQuery.data?.questionnaireResponse ?? undefined;

  const questionnaireIdentifierRef = useRef<string | null>(null);
  const prevNameRef = useRef(questionnaireName);
  if (prevNameRef.current !== questionnaireName) {
    prevNameRef.current = questionnaireName;
    questionnaireIdentifierRef.current = null;
  }
  if (questionnaireIdentifierRef.current === null && responseSettled) {
    questionnaireIdentifierRef.current =
      response?.questionnaire ?? questionnaireName;
  }

  const questionnaireQuery = useQuestionnaire({
    identifier: questionnaireIdentifierRef.current ?? questionnaireName,
    queryConfig: {
      placeholderData: keepPreviousData,
      enabled: responseSettled,
    },
  });

  const questionnaireId = questionnaireQuery.data?.questionnaire?.id;

  const createQuestionnaireResponseMutation = useCreateQuestionnaireResponse();
  const updateQuestionnaireResponseMutation = useUpdateQuestionnaireResponse();

  const [createdResponseId, setCreatedResponseId] = useState<
    string | undefined
  >(undefined);
  const responseId = response?.id ?? createdResponseId;

  const normalize = (items: QuestionnaireResponseItem[]) => {
    return normalizeItems ? normalizeItems(items) : items;
  };

  const createResponse = async (
    items: QuestionnaireResponseItem[],
    status: QuestionnaireResponseStatus,
  ) => {
    if (!questionnaireId) {
      return undefined;
    }

    const created = await createQuestionnaireResponseMutation.mutateAsync({
      questionnaire: questionnaireId,
      item: items as CreateQuestionnaireResponseBody['item'],
      status,
    });

    if (created?.id) {
      setCreatedResponseId(created.id);
    }

    return created?.id;
  };

  const updateResponse = (
    items: QuestionnaireResponseItem[],
    status: QuestionnaireResponseStatus,
    options?: SubmitOptions,
  ) => {
    if (!responseId) {
      return;
    }

    const variables = {
      id: responseId,
      data: { item: items, status },
      invalidateIdentifiers: [questionnaireName],
    };

    if (options) {
      updateQuestionnaireResponseMutation.mutate(variables, options);
      return;
    }

    updateQuestionnaireResponseMutation.mutate(variables);
  };

  const persist = async (
    items: QuestionnaireResponseItem[],
    status: QuestionnaireResponseStatus,
    options?: SubmitOptions,
  ) => {
    const normalizedItems = normalize(items);

    if (responseId) {
      updateResponse(normalizedItems, status, options);
      return;
    }

    if (normalizedItems.length === 0) {
      return;
    }

    const createdId = await createResponse(normalizedItems, status);
    if (status === 'completed' && createdId) {
      options?.onSuccess?.();
    }
  };

  const save = async (items: QuestionnaireResponseItem[]) => {
    await persist(items, 'in-progress');
  };

  const submit = async (
    items: QuestionnaireResponseItem[],
    options?: SubmitOptions,
  ) => {
    await persist(items, 'completed', options);
  };

  return {
    questionnaire: questionnaireQuery.data?.questionnaire,
    response,
    responseId,
    isLoading: questionnaireQuery.isPending || responseQuery.isLoading,
    save,
    submit,
  };
};
