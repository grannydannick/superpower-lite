import {
  Questionnaire,
  QuestionnaireResponse,
  QuestionnaireResponseItem,
} from '@medplum/fhirtypes';
import { useNavigate, useParams } from 'react-router-dom';

import { NotFoundRoute } from '@/app/routes/not-found';
import { Head } from '@/components/seo';
import { QuestionnaireForm } from '@/components/ui/questionnaire';
import { toast } from '@/components/ui/sonner';
import { Spinner } from '@/components/ui/spinner';
import {
  RxQuestionnaireName,
  RX_ASSESSMENTS,
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
import { preloadImage } from '@/utils/preload-image';

export const questionnaireLoader = () => async () => {
  /**
   * This hack is to "preload" all of the images used in questionnaire
   *
   * If we are not using this, images are loaded dynamically and create weird "flicker" effect
   * which this loader hopefully should fix
   */
  const preloadedImages = [
    '/onboarding/questionnaire/rx.webp', // Intro step image
    '/rx/identity.webp', // Identity verification step image
  ];

  const imagesPromiseList: Promise<any>[] = [];
  for (const i of preloadedImages) {
    imagesPromiseList.push(preloadImage(i));
  }

  return Promise.all(imagesPromiseList);
};

const isOnboardingQuestionnaire = (
  type: string | undefined,
): type is OnboardingQuestionnaireName =>
  ONBOARDING_QUESTIONNAIRE_NAMES.includes(type as OnboardingQuestionnaireName);

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

  if (!questionnaire || !userQuery.data) {
    return <NotFoundRoute />;
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

export const QuestionnaireRoute = () => {
  const { type } = useParams();
  const navigate = useNavigate();

  const onSubmit = () => {
    toast.success('Thanks for submission!');
    navigate('/');
  };

  const isSymptomTrackerQuestionnaire = isSymptomTracker(type);

  const subscriptionActiveQuery = useSubscriptionActive({
    questionnaireName: type as RxQuestionnaireName,
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
    return <NotFoundRoute />;
  }

  //NOTE: unfortunatly 'any' because Questionnaire names are coupled with
  // Questionnaire front door identifiers/response identifiers. TBD to decouple this.
  if (RX_ASSESSMENTS.includes(type as any)) {
    return (
      <RxQuestionnaire onSubmit={onSubmit} name={type as RxQuestionnaireName} />
    );
  }

  if (isOnboardingQuestionnaire(type)) {
    return <OnboardingQuestionnaire name={type} onSubmit={onSubmit} />;
  }

  return <NotFoundRoute />;
};
