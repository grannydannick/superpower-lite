import { Body2 } from '@/components/ui/typography';
import { cn } from '@/lib/utils';

export const ResultsProgress = ({ value }: { value: number }) => {
  return (
    <div className="relative">
      <div className="flex items-center justify-between gap-2 truncate">
        <Body2
          className={cn(
            'font-medium',
            value > 0 && value < 0.5 ? 'text-vermillion-900' : 'text-zinc-400',
          )}
        >
          Scheduled
        </Body2>
        <Body2
          className={cn(
            'font-medium',
            value > 0.5 ? 'text-vermillion-900' : 'text-zinc-400',
          )}
        >
          Processing
        </Body2>
        <Body2 className="truncate font-medium text-zinc-400">
          Results Ready
        </Body2>
      </div>
      <div className="relative mt-2 h-1 w-full overflow-hidden rounded-full bg-zinc-200">
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-vermillion-900 transition-all duration-500"
          style={{
            width: `${value * 100}%`,
          }}
        />
      </div>
    </div>
  );
};
