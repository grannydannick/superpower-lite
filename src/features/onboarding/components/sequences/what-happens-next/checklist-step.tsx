import { m } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Body1, H2 } from '@/components/ui/typography';
import { cn } from '@/lib/utils';

import { useSequence } from '../../../hooks/use-screen-sequence';
import { Sequence } from '../../sequence';

interface SetupItemData {
  id: string;
  title: string;
  description?: string;
  image: string;
}

const SETUP_ITEMS: SetupItemData[] = [
  {
    id: 'tell-us',
    title: 'Tell us about yourself',
    description: 'Set aside 10 min for best results',
    image: '/onboarding/what-happens-next/tell-us-about-you-paper.webp',
  },
  {
    id: 'additional-tests',
    title: 'Build your testing plan',
    image: '/onboarding/what-happens-next/additional-tests.webp',
  },
  {
    id: 'schedule-tests',
    title: 'Schedule your appointment',
    image: '/onboarding/what-happens-next/schedule-tests.webp',
  },
];

const SetupItem = ({
  item,
  isActive,
  index,
}: {
  item: SetupItemData;
  isActive: boolean;
  index: number;
}) => {
  return (
    <m.div
      className={cn(
        'relative mb-3 flex items-stretch overflow-hidden rounded-2xl border bg-white transition-colors',
        isActive
          ? 'border-vermillion-900 ring-2 ring-vermillion-900/20'
          : 'border-zinc-200',
      )}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: 0.4 + index * 0.1,
        ease: 'easeOut',
      }}
    >
      <div
        className={cn(
          'flex flex-1 items-center gap-3 pl-4',
          isActive ? 'py-5' : 'py-3',
        )}
      >
        <div
          className={cn(
            'w-6 shrink-0 bg-clip-text text-center text-2xl font-semibold tracking-tight text-transparent',
            isActive
              ? 'bg-gradient-to-b from-vermillion-700 to-vermillion-900'
              : 'bg-gradient-to-b from-vermillion-300 to-vermillion-500',
          )}
        >
          {index + 1}
        </div>
        <div className="flex-1">
          <div
            className={cn(
              'text-base font-medium',
              isActive ? 'text-zinc-900' : 'text-zinc-500',
            )}
          >
            {item.title}
          </div>
          {item.description && (
            <div className="mt-1 text-sm text-zinc-500">{item.description}</div>
          )}
        </div>
      </div>
      <img
        src={item.image}
        alt=""
        className={cn(
          'mr-3 shrink-0 self-stretch object-contain object-right',
          isActive ? 'h-28 w-32' : 'h-16 w-24 opacity-80',
        )}
      />
    </m.div>
  );
};

export const ChecklistStep = () => {
  const { next } = useSequence();

  return (
    <Sequence.StepLayout centered className="bg-zinc-50">
      <div className="flex flex-1 flex-col px-6 py-8">
        <div className="mx-auto w-full max-w-md">
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <H2 className="text-zinc-900">
              Let&apos;s build your health profile
            </H2>
            <Body1 className="mt-2 text-zinc-500">
              The more information you share the better your insights and
              recommendations will be.
            </Body1>
          </m.div>

          <m.div
            className="mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          >
            <div>
              {SETUP_ITEMS.map((item, index) => (
                <SetupItem
                  key={item.id}
                  item={item}
                  isActive={index === 0}
                  index={index}
                />
              ))}
            </div>
          </m.div>

          <p className="mt-8 text-center text-sm text-zinc-400">
            All your health data is private and secure,
            <br />
            and will never be sold to a third party.
          </p>
        </div>
      </div>

      <Sequence.StepFooter className="bg-zinc-50">
        <Button onClick={next} className="mx-auto w-full max-w-md">
          Next
        </Button>
      </Sequence.StepFooter>
    </Sequence.StepLayout>
  );
};
