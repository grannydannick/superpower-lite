import { useEffect, useState } from 'react';
import { useLocation, useNavigation } from 'react-router-dom';

import { Sidebar } from '@/components/shared/sidebar';
import { useUser } from '@/lib/auth';
import { cn } from '@/lib/utils';

const Progress = () => {
  const { state, location } = useNavigation();

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(0);
  }, [location?.pathname]);

  useEffect(() => {
    if (state === 'loading') {
      const timer = setInterval(() => {
        setProgress((oldProgress) => {
          if (oldProgress === 100) {
            clearInterval(timer);
            return 100;
          }
          const newProgress = oldProgress + 10;
          return newProgress > 100 ? 100 : newProgress;
        });
      }, 300);

      return () => {
        clearInterval(timer);
      };
    }
  }, [state]);

  if (state !== 'loading') {
    return null;
  }

  return (
    <div
      className="fixed left-0 top-0 h-1 bg-vermillion-900 transition-all duration-200 ease-in-out"
      style={{ width: `${progress}%` }}
    ></div>
  );
};

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
          <Progress />
          {children}
        </div>
      </main>
    </>
  );
}
