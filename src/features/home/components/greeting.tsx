import { useState } from 'react';

import { H2 } from '@/components/ui/typography';
import { useUser } from '@/lib/auth';
import { getDaytime } from '@/utils/get-date-time';

import { HomeCards } from './home-cards';
import { SharablesTabType, ShareableModal } from './shareable';

export const GreetingComponent = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeModalTab, setActiveModalTab] =
    useState<SharablesTabType>('superpower-score');

  const { data: user } = useUser();

  const handleCardClick = (tabType: SharablesTabType) => {
    setActiveModalTab(tabType);
    setIsModalOpen(true);
  };

  const handleTabChange = (tab: SharablesTabType) => {
    setActiveModalTab(tab);
  };

  const greeting = user?.firstName
    ? `Good ${getDaytime()} ${user.firstName},`
    : `Good ${getDaytime()},`;

  const greetingText = 'Welcome to Superpower';

  return (
    <header
      id="nav-reverse"
      className="size-full h-[700px] overflow-hidden bg-black py-32 md:px-8"
    >
      <div className="relative z-50 mx-auto max-w-6xl">
        <H2 className="mb-8 px-6 text-white md:px-0">
          {greeting} <br />
          <span className="text-white/75">{greetingText}</span>
        </H2>

        <ShareableModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          openTab={activeModalTab}
          onTabChange={handleTabChange}
        />
        <HomeCards onClick={handleCardClick} />
      </div>

      <div className="pointer-events-none absolute left-1/2 top-0 size-full max-w-[2010px] -translate-x-1/2 scale-150 overflow-hidden bg-home bg-cover bg-top blur-sm" />
    </header>
  );
};
