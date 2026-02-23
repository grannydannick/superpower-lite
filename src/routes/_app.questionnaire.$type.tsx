import {
  Questionnaire,
  QuestionnaireResponse,
  QuestionnaireResponseItem,
} from '@medplum/fhirtypes';
import { createFileRoute, notFound } from '@tanstack/react-router';
import { preload } from 'react-dom';

import { Head } from '@/components/seo';
import { QuestionnaireForm } from '@/components/ui/questionnaire';
import { toast } from '@/components/ui/sonner';
import { Spinner } from '@/components/ui/spinner';
import {
  RX_ASSESSMENTS,
  RxQuestionnaireName,
  isSymptomTracker,
} from '@/const/questionnaire';
import {
  ONBOARDING_QUESTIONNAIRE_NAMES,
  type OnboardingQuestionnaireName,
} from '@/features/onboarding/components/sequences/questionnaire/onboarding-questionnaire-step';
import { useSubscriptionActive } from '@/features/questionnaires/api/subscription-active';
import { RxQuestionnaire } from '@/features/questionnaires/components/rx-questionnaire';
import { useQuestionnaireResponseController } from '@/features/questionnaires/hooks/use-questionnaire-response-controller';
import { pruneResponseItems } from '@/features/questionnaires/utils/prune-response-items';
import { useUser } from '@/lib/auth';

export const Route = createFileRoute('/_app/questionnaire/$type')({
  loader: () => {
    preload('/onboarding/questionnaire/rx.webp', { as: 'image' });
    preload('/rx/identity.webp', { as: 'image' });
    return null;
  },
  component: QuestionnaireComponent,
});

function isOnboardingQuestionnaire(
  type: string | undefined,
): type is OnboardingQuestionnaireName {
  if (type == null) {
    return false;
  }

  for (const name of ONBOARDING_QUESTIONNAIRE_NAMES) {
    if (name === type) {
      return true;
    }
  }

  return false;
}

const OnboardingQuestionnaire = ({
  name,
  onSubmit,
}: {
  name: string;
  onSubmit: () => void;
}) => {
  const userQuery = useUser();
  const {
    questionnaire,
    response: questionnaireResponse,
    isLoading: isQuestionnaireLoading,
    save,
    submit,
  } = useQuestionnaireResponseController({
    questionnaireName: name,
    statuses: ['in-progress', 'completed', 'stopped'],
    normalizeItems: pruneResponseItems,
  });

  if (isQuestionnaireLoading || userQuery.isLoading) {
    return (
      <div className="flex h-dvh w-full items-center justify-center">
        <Spinner variant="primary" size="md" />
      </div>
    );
  }

  if (questionnaire == null || userQuery.data == null) {
    throw notFound();
  }

  const handleSave = async (item: QuestionnaireResponseItem[]) => {
    await save(item);
  };

  const handleSubmit = async (item: QuestionnaireResponseItem[]) => {
    await submit(item, { onSuccess: onSubmit });
  };

  return (
    <>
      <Head title="Questionnaire" />
      <QuestionnaireForm
        key={questionnaire.id}
        questionnaire={questionnaire as unknown as Questionnaire}
        response={questionnaireResponse as unknown as QuestionnaireResponse}
        user={userQuery.data}
        onSave={handleSave}
        onSubmit={handleSubmit}
        className="space-y-6"
      />
    </>
  );
};

function QuestionnaireComponent() {
  const { type } = Route.useParams();
  const navigate = Route.useNavigate();

  const onSubmit = () => {
    toast.success('Thanks for submission!');
    void navigate({ to: '/' });
  };

  const isSymptomTrackerQuestionnaire = isSymptomTracker(type);

  let questionnaireNameForSubscriptionActive: RxQuestionnaireName =
    RX_ASSESSMENTS[0];
  if (isSymptomTrackerQuestionnaire) {
    questionnaireNameForSubscriptionActive = type;
  }

  const subscriptionActiveQuery = useSubscriptionActive({
    questionnaireName: questionnaireNameForSubscriptionActive,
    queryConfig: {
      enabled: isSymptomTrackerQuestionnaire,
    },
  });

  if (isSymptomTrackerQuestionnaire && subscriptionActiveQuery.isLoading) {
    return (
      <div className="flex h-dvh w-full items-center justify-center">
        <Spinner variant="primary" size="md" />
      </div>
    );
  }

  if (
    isSymptomTrackerQuestionnaire &&
    (subscriptionActiveQuery.isError ||
      subscriptionActiveQuery.data?.active === false)
  ) {
    throw notFound();
  }

  let rxAssessmentName: RxQuestionnaireName | undefined = undefined;
  if (type != null) {
    for (const name of RX_ASSESSMENTS) {
      if (name === type) {
        rxAssessmentName = name;
        break;
      }
    }
  }

  if (rxAssessmentName != null) {
    return <RxQuestionnaire onSubmit={onSubmit} name={rxAssessmentName} />;
  }

  if (isOnboardingQuestionnaire(type)) {
    return <OnboardingQuestionnaire name={type} onSubmit={onSubmit} />;
  }

  throw notFound();
}
