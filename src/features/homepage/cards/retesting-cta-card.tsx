import { linkOptions } from '@tanstack/react-router';
import { ChevronRight } from 'lucide-react';

import { Link } from '@/components/ui/link';
import { Body1 } from '@/components/ui/typography';
import { useAnalytics } from '@/hooks/use-analytics';
import { cn } from '@/lib/utils';

export interface RetestingCtaCardProps {
  className?: string;
  source: string;
}

export const RetestingCtaCard = ({
  className,
  source,
}: RetestingCtaCardProps) => {
  const { track } = useAnalytics();

  return (
    <Link
      {...linkOptions({
        to: '/schedule',
        search: { mode: 'phlebotomy', showAddons: true, variant: 'retest' },
      })}
      onClick={() => {
        track('retesting_cta_clicked', {
          source,
          destination: 'schedule_marketplace',
          flow_context: 'schedule_retest',
          entrypoint: 'homepage_retesting_cta',
        });
      }}
      className={cn(
        'group block overflow-hidden rounded-[20px] border border-vermillion-900 bg-white shadow-[0_0_4px_0_rgba(252,95,43,0.5)]',
        className,
      )}
    >
      <div className="relative flex w-full items-center gap-3 p-4 text-left">
        <div className="relative flex size-4 items-center justify-center rounded-full bg-vermillion-100">
          <div className="size-1.5 rounded-full bg-vermillion-900" />
        </div>
        <div className="flex flex-1 items-center justify-between">
          <Body1 className="text-zinc-900">View retesting options</Body1>
          <ChevronRight className="size-5 text-zinc-400 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  );
};
