import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Body1, H2 } from '@/components/ui/typography';
import { useGender } from '@/hooks/use-gender';

import { useSequence } from '../../../hooks/use-screen-sequence';
import { Sequence } from '../../sequence';

type SubStep = 'intro' | 'build' | 'resolution';

const SUB_STEPS: SubStep[] = ['intro', 'build', 'resolution'];

const SUB_STEP_TO_IMAGE: Record<SubStep, number> = {
  intro: 1,
  build: 3,
  resolution: 5,
};

const SUB_STEP_CONTENT: Record<
  SubStep,
  { title: string; description: string }
> = {
  intro: {
    title: 'This is your digital twin',
    description:
      'Superpower visualizes your health data to get the most up-to-date view of your health.',
  },
  build: {
    title: 'Build your twin',
    description:
      'By adding more data you can unlock insights and recommendations that many doctors miss.',
  },
  resolution: {
    title: "Your twin's resolution reduces over time",
    description:
      'As your body changes, recommendations get less precise but you can re-test to keep it up-to-date.',
  },
};

const BUTTON_TEXT: Record<SubStep, string> = {
  intro: 'How it works',
  build: 'Next',
  resolution: 'Explore ways to solve this',
};

export const DigitalTwinExplainerStep = () => {
  const { next } = useSequence();
  const { gender } = useGender();
  const [currentSubStep, setCurrentSubStep] = useState<SubStep>('intro');
  const [currentImageNumber, setCurrentImageNumber] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const genderPrefix = gender === 'male' ? 'm' : 'f';

  const handleNext = () => {
    if (isTransitioning) return;

    const currentIndex = SUB_STEPS.indexOf(currentSubStep);
    if (currentIndex < SUB_STEPS.length - 1) {
      const nextSubStep = SUB_STEPS[currentIndex + 1];
      setCurrentSubStep(nextSubStep);

      // Start image transition sequence with intermediate image
      const intermediateImage = currentImageNumber + 1; // 2 or 4
      setIsTransitioning(true);
      setCurrentImageNumber(intermediateImage);
    } else {
      next();
    }
  };

  const handleImageAnimationComplete = () => {
    if (!isTransitioning) return;

    const targetImage = SUB_STEP_TO_IMAGE[currentSubStep];
    if (currentImageNumber !== targetImage) {
      // Move from intermediate to final image
      setCurrentImageNumber(targetImage);
    } else {
      // Transition complete
      setIsTransitioning(false);
    }
  };

  const imageSrc = `/onboarding/digital-twin/explainer/${genderPrefix}_digital_twin_${currentImageNumber}.webp`;
  const content = SUB_STEP_CONTENT[currentSubStep];

  return (
    <Sequence.StepLayout centered>
      <Sequence.StepMedia className="relative flex items-center justify-center">
        {/* Hidden image to maintain container height */}
        <img
          src={imageSrc}
          alt=""
          className="invisible size-full object-contain"
          aria-hidden="true"
        />
        {/* Animated images for crossfade */}
        <AnimatePresence initial={false}>
          <motion.img
            key={currentImageNumber}
            src={imageSrc}
            alt="Digital Twin Visualization"
            className="absolute inset-0 size-full object-contain"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            onAnimationComplete={handleImageAnimationComplete}
          />
        </AnimatePresence>
      </Sequence.StepMedia>

      <Sequence.StepContent className="mx-auto mb-8 max-w-md text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSubStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <H2 className="mb-1">{content.title}</H2>
            <Body1 className="text-secondary">{content.description}</Body1>
          </motion.div>
        </AnimatePresence>
      </Sequence.StepContent>

      <Sequence.StepFooter className="mx-auto w-full max-w-md">
        <Button
          onClick={handleNext}
          className="w-full bg-black text-white"
          disabled={isTransitioning}
        >
          {BUTTON_TEXT[currentSubStep]}
        </Button>
      </Sequence.StepFooter>
    </Sequence.StepLayout>
  );
};
