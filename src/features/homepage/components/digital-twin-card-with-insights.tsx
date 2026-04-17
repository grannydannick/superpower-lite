import { useEffect, useState } from 'react';

import { DigitalTwinCard } from './digital-twin-card';

const LG_BREAKPOINT_QUERY = '(min-width: 1024px)';

export const DigitalTwinCardWithInsights = () => {
  const [isLgUp, setIsLgUp] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(LG_BREAKPOINT_QUERY).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQueryList = window.matchMedia(LG_BREAKPOINT_QUERY);
    const handleChange = () => {
      setIsLgUp(mediaQueryList.matches);
    };

    mediaQueryList.addEventListener('change', handleChange);
    handleChange();

    return () => {
      mediaQueryList.removeEventListener('change', handleChange);
    };
  }, []);

  if (!isLgUp) return null;

  return (
    <div className="relative top-0 h-full">
      <div className="sticky top-[120px]">
        <DigitalTwinCard />
      </div>
    </div>
  );
};
