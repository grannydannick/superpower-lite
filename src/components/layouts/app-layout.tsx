import { motion } from 'framer-motion';
import * as React from 'react';
import { useLocation } from 'react-router-dom';

import { NavigationProgress } from '@/components/ui/navigation-progress';
import { AddressDialog } from '@/features/users/components/dialogs/address-dialog';
import { useUser } from '@/lib/auth';
import { cn } from '@/lib/utils';

import { Navbar } from '../shared/navbar';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { data } = useUser();
  const { pathname } = useLocation();
  /*
   * Completely hides navbar from UI.
   *
   * */
  const hideNavBar =
    !data ||
    pathname.includes('onboarding') ||
    pathname.includes('plans') ||
    pathname.includes('questionnaire');

  const whiteBgPaths = ['services'];
  const isWhiteBg =
    whiteBgPaths.some((path) => pathname.includes(path)) || pathname === '/';

  return (
    <main className={isWhiteBg ? 'bg-white' : 'bg-zinc-50'}>
      {!hideNavBar && <Navbar />}
      {data && data.primaryAddress === undefined ? (
        <AddressDialog mode={'add'} isDialogClosable={false} />
      ) : null}
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
    </main>
  );
}
