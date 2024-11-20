import React, { useState } from 'react';

import { ExpandableCard } from '@/features/onboarding/components/configurator/expandable-card';
import { CONFIGURATOR_ITEMS } from '@/features/onboarding/const/configurator-items';

const ConfiguratorSections = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <div className="mx-auto flex size-full flex-col items-center px-4 md:px-8 lg:max-w-[716px] lg:overflow-y-auto">
      <div className="max-w-[496px] flex-1 space-y-24 pb-40 pt-24">
        {CONFIGURATOR_ITEMS.map((item, index) => {
          return (
            <div key={index} className="flex flex-col justify-center">
              {item.component}
            </div>
          );
        })}
      </div>
      <ExpandableCard isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
    </div>
  );
};

export { ConfiguratorSections };
