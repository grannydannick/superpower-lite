import * as React from 'react';

import { SuperpowerLogo } from '@/components/icons/superpower-logo';
import { Progress } from '@/components/ui/progress';
import { Body2 } from '@/components/ui/typography';
import { CONFIGURATOR_ITEMS } from '@/features/onboarding/const/configurator-items';

const ConfiguratorSections = () => {
  const visibleItems = CONFIGURATOR_ITEMS.filter((item) => item.component);

  return (
    <div className="mx-auto flex size-full flex-col items-center gap-6 px-4 md:px-8 lg:max-w-2xl">
      <div className="flex w-full items-center justify-between">
        <SuperpowerLogo />
        <div className="flex items-center gap-4">
          <Body2 className="text-zinc-400">
            Step {3} / {3}
          </Body2>
          <Progress value={100} className="h-[3px] w-20" />
        </div>
      </div>
      <div className="flex flex-1 flex-col justify-center space-y-6">
        {visibleItems.map((item, index) => {
          return (
            <div
              key={index}
              // idea here with [&:empty]:hidden is some components return null and we want to hide them
              className="flex flex-col justify-center [&:empty]:hidden"
            >
              {item.component}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export { ConfiguratorSections };
