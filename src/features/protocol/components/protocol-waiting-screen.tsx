import { Lock } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Body1, Body2, Body3, H3, H4 } from '@/components/ui/typography';

export const ProtocolWaitingScreen = () => (
  <div className="mx-auto w-full max-w-[1600px] space-y-4 p-6 lg:px-16">
    <div className="grid-cols-5 space-y-16 lg:grid lg:gap-8 lg:space-y-0">
      <div className="col-span-3 space-y-6">
        <H3 className="text-black">Protocol</H3>
        <div className="space-y-4">
          <H4>Your protocol items</H4>
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="flex aspect-square w-16 shrink-0 items-center justify-center rounded-xl bg-zinc-200/50 p-2">
                <Lock className="size-4 text-secondary" />
              </div>
              <div className="space-y-0.5">
                <Body1 className="text-secondary">
                  Unlocks once your test results are processed
                </Body1>
                <Body2 className="text-secondary/75">Awaiting results</Body2>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="col-span-2 space-y-4">
        <H3 className="text-black">Goals</H3>
        <div className="relative h-80 w-full overflow-hidden rounded-3xl border border-white/10">
          <img
            src="/action-plan/goals/dead.webp"
            alt="Locked goal"
            className="pointer-events-none absolute inset-0"
          />
          <div className="absolute inset-0 z-10 flex flex-col justify-between p-6">
            <div className="mb-8 flex w-full items-start justify-end">
              <Badge className="rounded-full border border-white/10 bg-white/10 px-2 py-0.5 text-white backdrop-blur-md">
                Pending
              </Badge>
            </div>
            <div>
              <Body3 className="mb-2 font-mono font-normal uppercase text-white">
                Awaiting results
              </Body3>
              <div className="flex items-center gap-0.5 transition-all duration-200 ease-out group-hover:gap-1">
                <H3 className="text-white">
                  Your health goals will unlock once your test results are
                  processed
                </H3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
