import { Body1, H2 } from '@/components/ui/typography';
import { cn } from '@/lib/utils';

import { ScheduleFlowFooter } from '../schedule-flow-footer';

export const IntroStep = () => {
  return (
    <div className="flex flex-1 flex-col justify-between md:flex-none">
      <div className={cn('space-y-8 pt-10')}>
        <img
          className="media-organic-reveal h-[240px] w-full object-contain sm:h-[315px]"
          src="/scheduling/holding-hands.webp"
          alt="holding hands"
        />
        <div className="space-y-1">
          <H2 className="text-center">Let’s schedule your first test</H2>
          <Body1 className="text-center text-secondary">
            You can do your blood draw either in an in-person lab or if
            available, schedule an at-home service. <br />
            <br /> You can schedule your remaining tests later in your
            dashboard.
          </Body1>
        </div>
      </div>
      <ScheduleFlowFooter />
    </div>
  );
};
