import { useState } from 'react';
import { useLocation } from 'react-router-dom';

import { Sidebar } from '@/components/ui/sidebar/sidebar';
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
    !data ||
    data?.onboarding?.status === 'INCOMPLETE' ||
    pathname.includes('plans');

  const [open, setOpen] = useState(true);

  return (
    <>
      <main
        id="app"
        className={cn('flex flex-col-reverse sm:flex-row  bg-white w-full', '')}
      >
        {!hideNavBar && <Sidebar open={open} setOpen={setOpen} />}
        {/*there probably should be better way of doing this but works for v1*/}
        <div
          className={cn(
            'flex flex-col flex-1',
            !hideNavBar
              ? 'mb-[72px] md:mb-0 min-h-[calc(100dvh-72px)] md:h-screen overflow-x-hidden'
              : 'min-h-screen',
          )}
        >
          {children}
        </div>
      </main>
    </>
  );
}
