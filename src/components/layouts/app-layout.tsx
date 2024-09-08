import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useLocation, useNavigation } from 'react-router-dom';

import { Sidebar } from '@/components/shared/sidebar';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';
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
  const { width } = useWindowDimensions();
  /*
   * Completely hides sidebar from UI.
   *
   * */
  const hideNavBar =
    !data ||
    data?.onboarding?.status === 'INCOMPLETE' ||
    pathname.includes('plans');

  const isMd = width >= 768;

  const [open, setOpen] = useState(true);

  return (
    <>
      {!hideNavBar && <Sidebar open={open} setOpen={setOpen} />}
      {/*there probably should be better way of doing this but works for v1*/}
      <motion.div
        className={cn(
          'flex flex-col',
          !hideNavBar
            ? 'mb-[72px] md:mb-0 min-h-[calc(100dvh-72px)] md:min-h-dvh'
            : 'min-h-screen',
        )}
        animate={
          !hideNavBar
            ? {
                maxWidth: isMd
                  ? open
                    ? 'calc(100vw - 196px)'
                    : 'calc(100vw - 88px)'
                  : '100vw', // Reset width for smaller screens
                marginLeft: isMd ? (open ? '196px' : '88px') : '0px', // Reset marginLeft for smaller screens
              }
            : {}
        }
        transition={
          isMd && !hideNavBar
            ? { type: 'spring', stiffness: 300, damping: 30 }
            : {}
        }
      >
        <Progress />
        {children}
      </motion.div>
    </>
  );
}
