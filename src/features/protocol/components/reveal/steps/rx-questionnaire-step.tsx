import { useCallback, useEffect, useMemo, useRef } from 'react';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Body1, H3 } from '@/components/ui/typography';
import { useRevealStatus, type Activity } from '@/features/protocol/api';
import { RxQuestionnaire } from '@/features/questionnaires/components/rx-questionnaire';
import type { QuestionnaireName } from '@/types/api';

type RxQuestionnaireStepProps = {
  carePlanId: string;
  activities?: Activity[] | null;
  next: () => void;
};

type QuestionnaireDescriptor = {
  rxItemId: string;
  rxCatalogId: string;
  questionnaireName: QuestionnaireName;
  title?: string;
  overview?: string;
};

export const RxQuestionnaireStep = ({
  carePlanId,
  activities,
  next,
}: RxQuestionnaireStepProps) => {
  const revealStatusQuery = useRevealStatus(carePlanId);
  const hasAdvancedRef = useRef(false);

  const rxActivityMap = useMemo(() => {
    const map = new Map<
      string,
      {
        questionnaireName: QuestionnaireName;
        title?: string;
        overview?: string;
      }
    >();

    activities?.forEach((activity) => {
      if (
        activity.type === 'prescription' &&
        activity.prescription?.id &&
        activity.prescription.intakeUrl
      ) {
        // isolates Questionnaire slug from urls like:
        // /questionnaire/{slug}
        // /questionnaire/{slug}?{query}
        const questionnaireSlugWithQuery = activity.prescription.intakeUrl
          .split('/')
          .pop();
        const questionnaireSlug = questionnaireSlugWithQuery?.split('?')[0];

        if (!questionnaireSlug) {
          console.error(
            'Missing questionnaire slug for prescription activity',
            {
              prescriptionId: activity.prescription.id,
            },
          );
          return;
        }

        map.set(activity.prescription.id, {
          questionnaireName: questionnaireSlug as QuestionnaireName,
          title: activity.prescription.name,
          overview: activity.overview,
        });
      }
    });

    return map;
  }, [activities]);

  const pendingDescriptors = useMemo(() => {
    const items = revealStatusQuery.data?.reveal.protocolOrder?.rxItems ?? [];
    const rxStates = revealStatusQuery.data?.fulfillmentStates.rx ?? {};
    const descriptors: QuestionnaireDescriptor[] = [];

    for (const item of items) {
      const status = rxStates[item.id];
      if (status === 'COMPLETED') {
        continue;
      }

      if (!item.fhirQuestionnaireResponseId) {
        console.error('Missing QuestionnaireResponse id for RX item', {
          rxItemId: item.id,
          rxCatalogId: item.rxCatalogId,
        });
        continue;
      }

      const config = rxActivityMap.get(item.rxCatalogId);

      if (!config) {
        console.error('Unable to resolve questionnaire for RX item', {
          rxItemId: item.id,
          rxCatalogId: item.rxCatalogId,
        });
        continue;
      }

      descriptors.push({
        rxItemId: item.id,
        rxCatalogId: item.rxCatalogId,
        questionnaireName: config.questionnaireName,
        title: config.title,
        overview: config.overview,
      });
    }

    return descriptors;
  }, [
    revealStatusQuery.data?.fulfillmentStates.rx,
    revealStatusQuery.data?.reveal.protocolOrder?.rxItems,
    rxActivityMap,
  ]);

  const activeDescriptor = pendingDescriptors[0];
  // Skip the RX questionnaire step if all RX items are completed
  useEffect(() => {
    if (hasAdvancedRef.current) {
      return;
    }

    if (revealStatusQuery.isLoading) {
      return;
    }

    if (pendingDescriptors.length === 0) {
      hasAdvancedRef.current = true;
      next();
    }
  }, [next, pendingDescriptors.length, revealStatusQuery.isLoading]);

  const handleQuestionnaireSubmit = useCallback(async () => {
    await revealStatusQuery.refetch();
  }, [revealStatusQuery]);

  let content: JSX.Element | null = null;

  if (revealStatusQuery.isLoading) {
    content = (
      <div className="flex flex-1 items-center justify-center">
        <Spinner variant="primary" />
      </div>
    );
  } else if (revealStatusQuery.isError) {
    content = (
      <div className="space-y-4 text-center">
        <H3>We couldn’t load your questionnaires</H3>
        <Body1 className="text-secondary">
          Please refresh the page or try again later.
        </Body1>
        <Button onClick={() => revealStatusQuery.refetch()}>Try again</Button>
      </div>
    );
  } else if (activeDescriptor) {
    content = (
      <div className="flex flex-1 flex-col">
        <RxQuestionnaire
          showIntro={false}
          name={activeDescriptor.questionnaireName}
          onSubmit={handleQuestionnaireSubmit}
        />
      </div>
    );
  }

  return <div className="flex min-h-screen flex-col">{content}</div>;
};
