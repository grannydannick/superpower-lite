import { ExpandableCard } from '@/features/onboarding/components/configurator/expandable-card';
import { CONFIGURATOR_ITEMS } from '@/features/onboarding/const/configurator-items';

const ConfiguratorSections = () => {
  return (
    <div className="mx-auto flex size-full flex-col items-center px-4 md:px-8 lg:max-w-[716px] lg:overflow-y-auto">
      <div className="max-w-[496px] flex-1 pb-44 pt-24">
        {CONFIGURATOR_ITEMS.map((item, index) => {
          return (
            <div
              key={index}
              // idea here is some components return null and we want to hide them
              className="flex flex-col justify-center [&:not(:empty)]:mb-24 last:[&:not(:empty)]:mb-0"
            >
              {item.component}
            </div>
          );
        })}
      </div>
      <ExpandableCard />
    </div>
  );
};

export { ConfiguratorSections };
