import { SuperpowerLogo } from '@/components/icons/superpower-logo';
import { CONFIGURATOR_ITEMS } from '@/features/onboarding/const/configurator-items';

const ConfiguratorSections = () => {
  return (
    <div className="mx-auto flex size-full flex-col items-center px-4 md:px-8 lg:max-w-2xl">
      <SuperpowerLogo className="mb-12 mr-auto" />
      <div className="flex flex-1 flex-col justify-center">
        {CONFIGURATOR_ITEMS.map((item, index) => {
          return (
            <div
              key={index}
              // idea here is some components return null and we want to hide them
              className="flex flex-col justify-center [&:not(:empty)]:mb-12 last:[&:not(:empty)]:mb-0"
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
