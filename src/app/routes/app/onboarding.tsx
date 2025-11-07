import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { Spinner } from '@/components/ui/spinner';
import { OnboardingSteps } from '@/features/onboarding/components/onboarding-steps/onboarding-steps';
import { useTask } from '@/features/tasks/api/get-task';
import { preloadImage } from '@/utils/preload-image';

export const onboardingLoader = () => async () => {
  /**
   * This hack is to "preload" all of the images used in onboarding
   *
   * If we are not using this, images are loaded dynamically and create weird "flicker" effect
   * which this loader hopefully should fix
   *
   */
  const preloadedImages = [
    '/onboarding/bg-female-face.webp',
    '/onboarding/bg-male.webp',
    '/onboarding/bg-spine.webp',
    '/onboarding/bg-female-hands.webp',
  ];

  const imagesPromiseList: Promise<any>[] = [];
  for (const i of preloadedImages) {
    imagesPromiseList.push(preloadImage(i));
  }

  return Promise.all(imagesPromiseList);
};

export const OnboardingRoute = () => {
  const onboardingTask = useTask({
    taskName: 'onboarding',
  });

  const navigate = useNavigate();
  const hasCheckedInitialLoad = useRef(false);

  /**
   * This gets triggered on final step or if user already has onboarding completed
   * Only redirect on initial load, not on refetch
   */
  useEffect(() => {
    if (!onboardingTask.data) return;

    // Only check on initial load, skip refetches
    if (hasCheckedInitialLoad.current) return;

    if (onboardingTask.data.task.status === 'completed') {
      hasCheckedInitialLoad.current = true;
      navigate('/', {
        replace: true,
      });
    } else {
      // Mark as checked even if not completed, so we don't check again on refetch
      hasCheckedInitialLoad.current = true;
    }
  }, [onboardingTask.data, navigate]);

  if (onboardingTask.isLoading) {
    return (
      <div className="flex h-dvh w-full items-center justify-center">
        <Spinner variant="primary" size="lg" />
      </div>
    );
  }

  if (!onboardingTask.data) {
    return null;
  }

  return <OnboardingSteps />;
};
