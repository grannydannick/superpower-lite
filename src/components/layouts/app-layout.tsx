import { motion } from 'framer-motion';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';

import { Sidebar } from '@/components/shared/sidebar';
import { NavigationProgress } from '@/components/ui/navigation-progress';
import { useUser } from '@/lib/auth';
import { cn } from '@/lib/utils';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { data } = useUser();
  const { pathname } = useLocation();
  /*
   * Completely hides sidebar from UI.
   *
   * */
  const hideNavBar =
    !data || pathname.includes('onboarding') || pathname.includes('plans');

  const [open, setOpen] = useState(true);

  const whiteBgPaths = ['services', 'members', 'upcoming'];
  const isWhiteBg =
    whiteBgPaths.some((path) => pathname.includes(path)) || pathname === '/';

  return (
    <>
      {!hideNavBar && <Sidebar open={open} setOpen={setOpen} />}
      <NavigationProgress />
      <motion.div
        className={cn(
          'flex flex-col',
          isWhiteBg ? 'bg-white' : 'bg-zinc-50',
          !hideNavBar
            ? 'mb-[72px] md:mb-0 min-h-[calc(100dvh-72px)] md:min-h-dvh'
            : null,
          open && !hideNavBar
            ? 'md:ml-[196px] md:max-w-[calc(100dvw-196px]'
            : null,
          !open && !hideNavBar
            ? 'md:ml-[88px] md:max-w-[calc(100dvw-88px]'
            : null,
        )}
      >
        {children}
      </motion.div>
    </>
  );
}
