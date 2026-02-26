import {
  Questionnaire,
  QuestionnaireItem,
  QuestionnaireResponse,
  QuestionnaireResponseItem,
} from '@medplum/fhirtypes';
import { notFound, useSearch } from '@tanstack/react-router';
import { useMemo, useState } from 'react';

// TODO: move data fetching upstream, or make this a global component
import { QuestionnaireForm } from '@/components/ui/questionnaire';
import { RX_BILLING_PERIOD_LINKID } from '@/components/ui/questionnaire/const/special-linkids';
import { RxScreenOut } from '@/components/ui/questionnaire/rx-screen-out';
import { Spinner } from '@/components/ui/spinner';
import { RxQuestionnaireName } from '@/const/questionnaire';
import { useQuestionnaireResponseController } from '@/features/questionnaires/hooks/use-questionnaire-response-controller';
import { isMemberIneligible } from '@/features/questionnaires/utils/is-member-ineligible';
import { useUser } from '@/lib/auth';

function injectBillingCodeIntoQuestionnaire(
  q: Questionnaire,
  billingCode: string,
): Questionnaire {
  return {
    ...q,
    item: q.item?.map((item) => {
      if (item.type !== 'group' || !item.item) return item;
      return {
        ...item,
        item: item.item.map((subItem: QuestionnaireItem) => {
          if (subItem.linkId === RX_BILLING_PERIOD_LINKID) {
            return { ...subItem, initial: [{ valueString: billingCode }] };
          }
          return subItem;
        }),
      };
    }),
  };
}

function injectBillingCodeIntoResponse(
  response: QuestionnaireResponse,
  billingCode: string,
): QuestionnaireResponse {
  if (!response.item) return response;
  return {
    ...response,
    item: response.item.map((item) => {
      if (!item.item) return item;
      return {
        ...item,
        item: item.item.map((subItem) => {
          if (subItem.linkId === RX_BILLING_PERIOD_LINKID) {
            return { ...subItem, answer: [{ valueString: billingCode }] };
          }
          return subItem;
        }),
      };
    }),
  };
}

export const RxQuestionnaire = ({
  name,
  onSubmit,
}: {
  name: RxQuestionnaireName;
  onSubmit?: () => void;
}) => {
  const billingCode = useSearch({
    strict: false,
    select: (s: Record<string, unknown>) => s.billingCode as string | undefined,
  });
  const [showIneligibleScreen, setShowIneligibleScreen] =
    useState<boolean>(false);
  const userQuery = useUser();
  const {
    questionnaire,
    response: questionnaireResponse,
    isLoading: isQuestionnaireLoading,
    save,
    submit,
  } = useQuestionnaireResponseController({
    questionnaireName: name,
    statuses: ['in-progress', 'stopped'],
  });

  const preparedQuestionnaire = useMemo(() => {
    const q = questionnaire as unknown as Questionnaire;
    if (!q || !billingCode) return q;
    return injectBillingCodeIntoQuestionnaire(q, billingCode);
  }, [questionnaire, billingCode]);

  const preparedResponse = useMemo(() => {
    const r = questionnaireResponse as unknown as QuestionnaireResponse;
    if (!billingCode || !r) return r ?? undefined;
    return injectBillingCodeIntoResponse(r, billingCode);
  }, [questionnaireResponse, billingCode]);

  if (isQuestionnaireLoading || userQuery.isLoading) {
    return (
      <div className="flex h-dvh w-full items-center justify-center">
        <Spinner variant="primary" size="md" />
      </div>
    );
  }

  //TODO: move this upstream
  if (questionnaire == null) {
    console.error('Questionnaire not found');
    throw notFound();
  }

  if (userQuery.data == null) {
    console.error('User not found');
    throw notFound();
  }

  if (showIneligibleScreen && questionnaireResponse != null) {
    return (
      <RxScreenOut
        response={questionnaireResponse as unknown as QuestionnaireResponse}
      />
    );
  }

  const handleSave = (item: QuestionnaireResponseItem[]) => {
    save(item);
  };

  const handleSubmit = (item: QuestionnaireResponseItem[]) => {
    if (questionnaire == null) return;
    const isIneligible = isMemberIneligible(
      item,
      (questionnaire as Questionnaire).item ?? [],
    );

    // NOTE(audric): server-side also handles frontdoor screenout logic.
    submit(item, {
      onSuccess: () => {
        if (isIneligible == true) {
          setShowIneligibleScreen(true);
        } else {
          // NOTE(audric): includes case for inEligible === undefined;
          // on failure default to NP approval downstream flow
          if (onSubmit != null) {
            onSubmit();
          }
        }
      },
    });
  };

  return (
    <QuestionnaireForm
      key={questionnaire.id}
      questionnaire={preparedQuestionnaire}
      response={preparedResponse}
      user={userQuery.data}
      onSave={handleSave}
      onSubmit={handleSubmit}
      className="space-y-6"
    />
  );
};
