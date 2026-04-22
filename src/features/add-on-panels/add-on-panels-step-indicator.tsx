import { cn } from '@/lib/utils';

type Step = {
  id: string;
  label: string;
};

interface AddOnPanelsStepIndicatorProps {
  steps: Step[];
  activeStepId: string;
  className?: string;
}

export const AddOnPanelsStepIndicator = ({
  steps,
  activeStepId,
  className,
}: AddOnPanelsStepIndicatorProps) => (
  <nav
    aria-label="Progress"
    className={cn('flex items-center gap-2', className)}
  >
    {steps.map((step, index) => {
      const isActive = step.id === activeStepId;

      return (
        <div key={step.id} className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-medium',
                isActive
                  ? 'bg-vermillion-900 text-white'
                  : 'border border-zinc-200 text-zinc-400',
              )}
              aria-current={isActive ? 'step' : undefined}
            >
              {index + 1}
            </div>
            <span
              className={cn(
                'text-sm',
                isActive
                  ? 'font-medium text-zinc-900'
                  : 'font-normal text-zinc-400',
              )}
            >
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <span
              aria-hidden="true"
              className="h-px w-6 shrink-0 bg-zinc-200"
            />
          )}
        </div>
      );
    })}
  </nav>
);
