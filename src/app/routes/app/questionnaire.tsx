import { useNavigate, useParams } from 'react-router-dom';

import { NotFoundRoute } from '@/app/routes/not-found';
import { toast } from '@/components/ui/sonner';
import { Spinner } from '@/components/ui/spinner';
import {
  RxQuestionnaireName,
  RX_ASSESSMENTS,
  isSymptomTracker,
} from '@/const/questionnaire';
import { useSubscriptionActive } from '@/features/questionnaires/api/subscription-active';
import { RxQuestionnaire } from '@/features/questionnaires/components/rx-questionnaire';
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

  return <NotFoundRoute />;
};
