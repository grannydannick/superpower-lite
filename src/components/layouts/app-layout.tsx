import { motion } from 'framer-motion';
import * as React from 'react';
import { useLocation } from 'react-router-dom';

import { FloatingWrapper } from '@/components/shared/floating-wrapper';
import { NavigationProgress } from '@/components/ui/navigation-progress';
import { WHITE_BACKGROUND_PATHS } from '@/const/white-background-paths';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useUser } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { ConsentDialog } from 'src/features/consent/components/consent-dialog';

import { Navbar } from '../shared/navbar';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { data } = useUser();
  const { pathname } = useLocation();

  // matches theme colors
  useThemeColor();

  /*
   * Completely hides navbar from UI.
   *
   * */
  const hideNavBar =
    !data ||
    pathname.includes('onboarding') ||
    pathname.includes('questionnaire') ||
    pathname.includes('legacy-checkout');

  const isWhiteBg =
    WHITE_BACKGROUND_PATHS.some((path) => pathname.includes(path)) ||
    pathname === '/';

  return (
    <main className={isWhiteBg ? 'bg-white' : 'bg-zinc-50'}>
      {!hideNavBar && <Navbar />}
      <ConsentDialog />
      <NavigationProgress />
      <motion.div
        className={cn(
          'flex flex-col flex-1',
          !hideNavBar
            ? 'mb-[72px] md:mb-0 min-h-[calc(100dvh-72px)] md:min-h-[calc(100dvh-68px)]'
            : null,
        )}
      >
        {children}
      </motion.div>
      <FloatingWrapper />
    </main>
  );
}
