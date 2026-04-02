import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';

export const ChartTooltip = ({
  children,
  isOpen,
  position,
  className,
  side = 'right',
  interactive = false,
  onMouseEnter,
  onMouseLeave,
}: {
  children: React.ReactNode;
  isOpen: boolean;
  position: { x: number; y: number };
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
  interactive?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) => {
  const [lastOpenContent, setLastOpenContent] = useState<React.ReactNode>(null);

  useEffect(() => {
    if (!isOpen) return;

    const timeoutId = setTimeout(() => {
      setLastOpenContent(children);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [children, isOpen]);

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

  // dismiss the tooltip on any scroll/wheel/touch while open to avoid sticky tooltips
  useEffect(() => {
    if (!isOpen) return;

    const hide = () => {
      onMouseLeave?.();
    };

    window.addEventListener('scroll', hide, { capture: true, passive: true });
    window.addEventListener('wheel', hide, { capture: true, passive: true });
    window.addEventListener('touchstart', hide, {
      capture: true,
      passive: true,
    });

    return () => {
      window.removeEventListener('scroll', hide, { capture: true });
      window.removeEventListener('wheel', hide, { capture: true });
      window.removeEventListener('touchstart', hide, { capture: true });
    };
  }, [isOpen, onMouseLeave]);

  const displayedContent = isOpen ? children : lastOpenContent;

  return (
    <div
      className={cn(
        'absolute z-[53] transition-all duration-200 ease-in-out',
        interactive ? 'pointer-events-auto' : 'pointer-events-none',
      )}
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
          'w-auto rounded-lg border bg-popover px-2 py-1.5 text-sm text-popover-foreground shadow-md shadow-black/5',
          'transition-all duration-300 ease-in-out',
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
