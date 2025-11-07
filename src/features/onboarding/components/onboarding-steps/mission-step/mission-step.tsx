import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { OnboardingLayout } from '@/components/layouts/onboarding-layout';
import { Button } from '@/components/ui/button';
import { H1, H3, H4 } from '@/components/ui/typography';

import { Activation } from './animation';

const MISSION_CONTENT = [
  'Healthcare is broken. From poor food quality, to inescapable environmental toxins, to a modern lifestyle at odds with our biology, it has never been harder to be healthy.',
  'Superpower is a new approach to living. We believe in health as a lifestyle. Being healthy isn’t solved by a magic pill or quick fix, but by the choices we make everyday.',
  'But you don’t have to go at it alone. We make sure you’re guided by experts long-term. Your health is personal, and we go deep to understand every aspect of it.',
  'As your lifelong health partner, we’re here to help you be the healthiest version of yourself. ',
  'Because if you superpower your health you superpower your life.',
];

export const Mission = () => {
  const navigate = useNavigate();

  const onClick = () => {
    navigate('/');
  };

  return (
    <section
      id="main"
      className="mx-auto flex max-w-[570px] flex-col items-center gap-[50px] py-[50px]"
    >
      <div className="space-y-3">
        <H4 className="w-full text-center text-white opacity-80">
          It&apos;s time to
        </H4>
        <H1 className="text-white">Superpower your life</H1>
      </div>
      <div className="space-y-8 overflow-y-auto">
        {MISSION_CONTENT.map((item, index) => (
          <H3 className="text-white" key={index}>
            {item}
          </H3>
        ))}
        <Button
          onClick={onClick}
          type="submit"
          className="w-full"
          variant="white"
        >
          I&apos;m ready to commit to my health
        </Button>
      </div>
    </section>
  );
};

export const MissionStep = () => {
  const [sequence, setSequence] = useState<number>(0);

  // Scroll to the top of the page when the sequence is 3, needed for mobile
  useEffect(() => {
    const scrollToTop = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (sequence === 3) {
      scrollToTop();
    }

    return () => {
      window.removeEventListener('scroll', scrollToTop);
    };
  }, [sequence]);

  if (sequence < 3) {
    return <Activation sequence={sequence} setSequence={setSequence} />;
  }

  return (
    <OnboardingLayout title="Mission" className="bg-spine">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1.0] }}
      >
        <Mission />
      </motion.div>
    </OnboardingLayout>
  );
};
