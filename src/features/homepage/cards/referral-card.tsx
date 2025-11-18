import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { Body1, Body2, H4 } from '@/components/ui/typography';

import { HomepageCard } from '../components/homepage-card';

export const ReferralCard: React.FC = () => {
  return (
    <HomepageCard title="Live better, longer together">
      <div className="group relative cursor-pointer overflow-hidden rounded-3xl">
        <div className="relative flex items-stretch justify-between bg-zinc-900 px-6">
          <div className="absolute -left-12 top-0 h-full overflow-hidden md:inset-0">
            <motion.img
              src="/home/refer-a-friend.png"
              alt="Refer a friend illustration"
              className="pointer-events-none h-full w-auto select-none object-contain object-left md:size-full md:object-left-top"
              initial={{ y: 12 }}
              animate={{ y: 0 }}
              transition={{
                type: 'easeInOut',
                stiffness: 220,
                damping: 20,
                mass: 0.9,
              }}
            />
          </div>
          <div className="relative z-10 flex gap-4">
            <div className="p-4 md:px-20 md:py-6">
              <Body2 className="line-clamp-1 text-zinc-400">
                Give the gift of health.
              </Body2>
              <H4 className="hidden text-white md:block">
                Refer your friends and earn $50
              </H4>
              <Body1 className="block text-white md:hidden">
                Refer friends and earn $50
              </Body1>
            </div>
          </div>
          <NavLink
            to={`/invite`}
            className="relative z-10 flex flex-col justify-center py-6"
          >
            <ChevronRight className="size-5 text-white transition-all group-hover:-mr-1" />
          </NavLink>
        </div>
      </div>
    </HomepageCard>
  );
};
