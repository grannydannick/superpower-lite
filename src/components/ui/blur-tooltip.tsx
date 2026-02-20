import * as React from 'react';
import { useState, useEffect } from 'react';

import { useWindowDimensions } from '@/hooks/use-window-dimensions';
import { cn } from '@/lib/utils';

interface BlurTooltipProps {
  children: React.ReactNode;
  message: string;
  showOnMobile?: boolean;
  mobileTimeout?: number;
}

export const BlurTooltip = ({
  children,
  message,
  showOnMobile = true,
  mobileTimeout = 3000,
}: BlurTooltipProps) => {
  const { width } = useWindowDimensions();
  const isMobile = width <= 768;
  const [showMobileBadge, setShowMobileBadge] = useState(false);

  // Handle timeout for mobile badge
  useEffect(() => {
    if (showMobileBadge && isMobile) {
      const timer = setTimeout(() => {
        setShowMobileBadge(false);
      }, mobileTimeout);

      return () => clearTimeout(timer);
    }
  }, [showMobileBadge, isMobile, mobileTimeout]);

  const handleClick = () => {
    if (isMobile && showOnMobile) {
      setShowMobileBadge(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      if (isMobile && showOnMobile) {
        setShowMobileBadge(true);
      }
    }
  };

  return (
    <div
      className="group relative"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      {/* Static content */}
      <div
        className={cn(
          'transition-all ease-out md:group-hover:blur-lg',
          showMobileBadge && 'blur-sm',
        )}
      >
        {children}
      </div>

      {/* Tooltip with pure Tailwind CSS */}
      <div
        className={cn(
          'pointer-events-none absolute -inset-3 flex items-center justify-center overflow-hidden bg-white/5 transition-all ease-out',
          'scale-90 opacity-0 md:group-hover:scale-100 md:group-hover:opacity-100',
          showMobileBadge && 'scale-100 opacity-100',
        )}
      >
        <div className="px-4 py-1.5 text-center text-zinc-400/90 md:text-2xl">
          {message}
        </div>
      </div>
    </div>
  );
};
