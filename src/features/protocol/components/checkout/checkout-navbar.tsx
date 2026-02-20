import { SuperpowerLogo } from '@/components/icons/superpower-logo';
import { Body1, Body2, H2 } from '@/components/ui/typography';
import { REVEAL_STEPS } from '@/features/protocol/components/reveal/reveal-stepper';
import { cn } from '@/lib/utils';

const SEGMENTS: Array<{
  key: 'products' | 'service' | 'rx';
  title: string;
  steps: string[];
}> = [
  {
    key: 'products',
    title: 'Supplements',
    steps: [REVEAL_STEPS.PRODUCT_CHECKOUT],
  },
  {
    key: 'service',
    title: 'Testing',
    steps: [REVEAL_STEPS.SERVICE_CHECKOUT],
  },
  { key: 'rx', title: 'Prescriptions', steps: [REVEAL_STEPS.RX_QUESTIONNAIRE] },
];

export const CheckoutNavbar = ({
  step,
  className,
}: {
  step: string;
  className?: string;
}) => {
  const currentIndex = SEGMENTS.findIndex((seg) => seg.steps.includes(step));

  return (
    <div className={cn('mx-auto w-full max-w-[1600px] px-6', className)}>
      <nav className="flex w-full items-center justify-between gap-4 lg:gap-16">
        <SuperpowerLogo className="w-32" />
        <div className="mb-3 flex w-full flex-1 items-center gap-2">
          {SEGMENTS.map((seg, i) => {
            const isCurrent = i === currentIndex;
            const isPast = currentIndex !== -1 && i < currentIndex;

            return (
              <div
                key={seg.key}
                className={cn(
                  'h-[5px] w-full rounded-full transition-all duration-200 ease-out',
                  currentIndex === -1
                    ? 'min-w-4 bg-zinc-200'
                    : isPast
                      ? 'bg-vermillion-900'
                      : isCurrent
                        ? 'w-3/4 shrink-0 bg-vermillion-900'
                        : 'min-w-4 bg-zinc-200',
                )}
              />
            );
          })}
        </div>
        <SuperpowerLogo className="invisible w-32" />
      </nav>
      <H2 className="my-4 lg:hidden">Checkout</H2>
      <div className="flex w-full items-center lg:hidden">
        <div className="flex w-full items-center justify-between gap-6">
          {SEGMENTS.map((seg, i) => {
            const isCurrent = i === currentIndex;

            return (
              <div key={i} className="flex items-center gap-2">
                <Body2
                  className={cn(
                    'flex aspect-square size-6 shrink-0 items-center justify-center rounded-full bg-zinc-400 text-white',
                    isCurrent && 'bg-primary',
                  )}
                >
                  {i + 1}
                </Body2>
                <Body1
                  className={cn('text-zinc-400', isCurrent && 'text-primary')}
                >
                  {seg.title}
                </Body1>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
