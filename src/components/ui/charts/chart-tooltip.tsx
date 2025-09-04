import { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

export const ChartTooltip = ({
  children,
  isOpen,
  position,
  className,
  side = 'right',
  onMouseEnter,
  onMouseLeave,
}: {
  children: React.ReactNode;
  isOpen: boolean;
  position: { x: number; y: number };
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) => {
  const [displayedContent, setDisplayedContent] =
    useState<React.ReactNode>(null);
  const contentTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // this function prevents the tooltip from going out of bound and adding horizontal scroll or something weird
  const getAdjustedPositionAndTransform = () => {
    const TOOLTIP_WIDTH = 128;
    const PADDING = 8;
    const screenWidth = window.innerWidth;

    let adjustedX = position.x;
    let transformX = '-50%';

    if (position.x - TOOLTIP_WIDTH / 2 < PADDING) {
      adjustedX = PADDING + TOOLTIP_WIDTH / 2;
      transformX = '-50%';
    } else if (position.x + TOOLTIP_WIDTH / 2 > screenWidth - PADDING) {
      adjustedX = screenWidth - PADDING - TOOLTIP_WIDTH / 2;
      transformX = '-50%';
    }

    return {
      left: `${adjustedX}px`,
      top: `${position.y}px`,
      transform: `translate(${transformX}, -50%)`,
    };
  };

  const adjustedStyle = getAdjustedPositionAndTransform();

  useEffect(() => {
    if (isOpen) {
      if (contentTimeoutRef.current) {
        clearTimeout(contentTimeoutRef.current);
        contentTimeoutRef.current = null;
      }
      setDisplayedContent(children);
    } else {
      if (displayedContent !== null) {
        contentTimeoutRef.current = setTimeout(() => {
          setDisplayedContent(null);
          contentTimeoutRef.current = null;
        }, 500);
      }
    }

    return () => {
      if (contentTimeoutRef.current) {
        clearTimeout(contentTimeoutRef.current);
        contentTimeoutRef.current = null;
      }
    };
  }, [isOpen, children, displayedContent]);
  return (
    <div
      className="pointer-events-none absolute z-50 transition-all duration-200 ease-in-out"
      style={{
        ...adjustedStyle,
        opacity: isOpen ? 1 : 0,
        visibility: isOpen ? 'visible' : 'hidden',
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div
        className={cn(
          'rounded-lg w-auto border bg-popover px-2 py-1.5 text-sm text-popover-foreground shadow-md shadow-black/5',
          'transition-all duration-300 ease-in-out pointer-events-none',
          isOpen
            ? 'animate-in fade-in zoom-in'
            : 'animate-out fade-out-0 zoom-out-95',
          className,
        )}
        style={{
          transformOrigin:
            side === 'top'
              ? 'bottom center'
              : side === 'bottom'
                ? 'top center'
                : side === 'left'
                  ? 'right center'
                  : 'left center',
        }}
      >
        {displayedContent}
      </div>
    </div>
  );
};
