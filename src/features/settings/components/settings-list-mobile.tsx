import { ChevronLeft } from 'lucide-react';
import { Fragment, useState } from 'react';

import { Header } from '@/components/shared/header';
import { Billing } from '@/features/settings/components/billing/billing';
import { Membership } from '@/features/settings/components/membership/membership';
import { Profile } from '@/features/settings/components/profile/profile';
import { OrdersList } from '@/features/settings/components/purchases/orders-list';
import { WearablesTable } from '@/features/settings/components/wearables/wearables-table';
import { SETTINGS_MOBILE } from '@/features/settings/const/settings-mobile';
import { MobileMenu } from '@/features/settings/types/mobile-menu';
import { cn } from '@/lib/utils';
import { capitalize } from '@/utils/format';

// TODO: had not a lot of time to refactor this, need to come up with better global approach for mobile (NM 09/04/2024)

export const SettingsListMobile = () => {
  const [current, setCurrent] = useState<MobileMenu | undefined>(undefined);
  const menuItem = SETTINGS_MOBILE.find((sm) => sm.value === current);

  return (
    <div className="flex-1 bg-zinc-50 md:hidden">
      <div className="p-6">
        {!current ? (
          <Header title="Settings" className="pb-8 pt-4" />
        ) : (
          <div className="space-y-6 py-6">
            <div
              role="presentation"
              className="flex size-[44px] cursor-pointer items-center justify-center rounded-full bg-white shadow-[0px_32px_64px_0px_rgba(212,212,212,0.25)]"
              onClick={() => setCurrent(undefined)}
            >
              <ChevronLeft width={16} height={16} color="black" />
            </div>

            <Header
              title={capitalize(menuItem?.value as string)}
              description={menuItem?.description}
            />
          </div>
        )}
        {current === 'profile' && <Profile />}
        {current === 'billing' && <Billing />}
        {current === 'membership' && <Membership />}
        {current === 'integrations' && <WearablesTable />}
        {current === 'order history' && <OrdersList />}
        {!current && (
          <>
            <div className="mb-2 flex h-[160px] gap-2">
              {SETTINGS_MOBILE.slice(0, 2).map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <div
                    className="flex w-full cursor-pointer flex-col justify-between rounded-[20px] bg-white p-5"
                    role="presentation"
                    onClick={() => setCurrent(item.value as MobileMenu)}
                    key={index}
                  >
                    <IconComponent width={20} height={20} color="#71717A" />
                    <div className="flex flex-col">
                      <h2 className="text-xl text-[#3F3F46]">
                        {capitalize(item.value)}
                      </h2>
                      <p className="text-xs text-[#A1A1AA]">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex flex-col rounded-[20px] bg-white">
              {SETTINGS_MOBILE.slice(2).map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <Fragment key={index}>
                    <div
                      className={cn(
                        'p-5 flex gap-4 cursor-pointer',
                        item.disabled &&
                          'cursor-not-allowed disabled pointer-events-none opacity-50',
                      )}
                      role="presentation"
                      onClick={() => setCurrent(item.value as MobileMenu)}
                    >
                      <IconComponent width={20} height={20} color="#71717A" />
                      <div className="flex flex-col gap-1">
                        <h2 className="text-xl text-[#3F3F46]">
                          {capitalize(item.value)}
                        </h2>
                        <p className="text-xs text-[#A1A1AA]">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    {index !== SETTINGS_MOBILE.slice(2).length - 1 && <hr />}
                  </Fragment>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
