import { Body2 } from '@/components/ui/typography';
import { cn } from '@/lib/utils';

type AppointmentStatus = 'scheduled' | 'processing';

interface PhlebotomyProgressProps {
  status: AppointmentStatus;
}

export const PhlebotomyProgress = ({ status }: PhlebotomyProgressProps) => {
  return (
    <div className="relative">
      <div className="flex items-center justify-between">
        <Body2
          className={cn(
            'font-medium',
            status === 'scheduled' ? 'text-vermillion-600' : 'text-zinc-400',
          )}
        >
          Scheduled
        </Body2>
        <Body2
          className={cn(
            'font-medium',
            status === 'processing' ? 'text-vermillion-600' : 'text-zinc-400',
          )}
        >
          Processing
        </Body2>
        <Body2 className="font-medium text-zinc-400">Results Ready</Body2>
      </div>
      <div className="relative mt-2 h-1 w-full overflow-hidden rounded-full bg-zinc-200">
        <div
          className={cn(
            'absolute left-0 top-0 h-full rounded-full bg-vermillion-900 transition-all duration-500',
            status === 'scheduled' && 'w-[33%]',
            status === 'processing' && 'w-[66%]',
          )}
        />
      </div>
    </div>
  );
};
