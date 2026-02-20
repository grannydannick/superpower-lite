import { CSSProperties, useRef } from 'react';

import { cn } from '@/lib/utils';

type Options = {
  shadow?: {
    opacity?: CSSProperties['opacity'];
    color?: CSSProperties['color'];
  };
  shimmer?: {
    mixBlendMode?: CSSProperties['mixBlendMode'];
  };
  resetOnHover?: boolean;
  resetDuration?: number;
};

// A 3D hover effect component which puts a 3D effect on the card when hovering over it. It uses vanilla CSS variables to avoid using React state.
export const Hover3D = ({
  children,
  className,
  disabled,
  // We preset the options to avoid having to pass them in every time
  options = {
    resetOnHover: true,
    resetDuration: 300,
  },
}: {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  options?: Options;
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || disabled) return;

    const card = cardRef.current;
    const rect = card.getBoundingClientRect();

    const cardCenterX = rect.left + rect.width / 2;
    const cardCenterY = rect.top + rect.height / 2;

    const mouseX = e.clientX;
    const mouseY = e.clientY;

    const angleY = -(mouseX - cardCenterX) / 20;
    const angleX = (mouseY - cardCenterY) / 20;

    card.style.setProperty('--rotate-x', `${angleX}deg`);
    card.style.setProperty('--rotate-y', `${angleY}deg`);
    card.style.setProperty('--shadow-x', `${angleY * -2}px`);
    card.style.setProperty('--shadow-y', `${angleX * 2}px`);
    card.style.setProperty('--duration', '0ms');
    card.style.setProperty('--shadow-duration', '0ms');
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!cardRef.current || e.touches.length < 1 || disabled) return;

    e.preventDefault();

    const card = cardRef.current;
    const rect = card.getBoundingClientRect();

    const cardCenterX = rect.left + rect.width / 2;
    const cardCenterY = rect.top + rect.height / 2;

    const touch = e.touches[0];
    const touchX = touch.clientX;
    const touchY = touch.clientY;

    const angleY = -(touchX - cardCenterX) / 10;
    const angleX = (touchY - cardCenterY) / 10;

    card.style.setProperty('--rotate-x', `${angleX}deg`);
    card.style.setProperty('--rotate-y', `${angleY}deg`);
    card.style.setProperty('--shadow-x', `${angleY * -2}px`);
    card.style.setProperty('--shadow-y', `${angleX * 2}px`);
    card.style.setProperty('--duration', '0ms');
    card.style.setProperty('--shadow-duration', '0ms');
  };

  const handleEnd = () => {
    if (!cardRef.current || !options?.resetOnHover || disabled) return;

    const resetDuration = options.resetDuration || 500;
    const card = cardRef.current;

    card.style.setProperty('--rotate-x', '0deg');
    card.style.setProperty('--rotate-y', '0deg');
    card.style.setProperty('--shadow-x', '0px');
    card.style.setProperty('--shadow-y', '0px');
    card.style.setProperty('--duration', `${resetDuration}ms`);
    card.style.setProperty('--shadow-duration', `${resetDuration}ms`);
  };

  const handleStart = (
    e: React.TouchEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement>,
  ) => {
    if ('touches' in e) {
      e.preventDefault();
    }

    const touches = 'touches' in e ? e.touches : [];
    const clientX = 'clientX' in e ? e.clientX : touches[0].clientX;
    const clientY = 'clientY' in e ? e.clientY : touches[0].clientY;

    if (
      !cardRef.current ||
      touches.length < 1 ||
      !clientX ||
      !clientY ||
      disabled
    )
      return;

    const card = cardRef.current;
    const rect = card.getBoundingClientRect();

    const cardCenterX = rect.left + rect.width / 2;
    const cardCenterY = rect.top + rect.height / 2;

    const touchX = clientX;
    const touchY = clientY;

    const angleY = -(touchX - cardCenterX) / 10;
    const angleX = (touchY - cardCenterY) / 10;

    card.style.setProperty('--rotate-x', `${angleX}deg`);
    card.style.setProperty('--rotate-y', `${angleY}deg`);
    card.style.setProperty('--shadow-x', `${angleY * -2}px`);
    card.style.setProperty('--shadow-y', `${angleX * 2}px`);
    card.style.setProperty('--duration', '0ms');
    card.style.setProperty('--shadow-duration', '0ms');
  };

  return (
    <div
      ref={cardRef}
      className={cn(
        'relative touch-manipulation',
        disabled && 'pointer-events-none',
      )}
      // Hack to prevent the default behavior of the card when disabled
      onMouseEnter={disabled ? undefined : handleStart}
      onMouseMove={disabled ? undefined : handleMouseMove}
      onMouseLeave={disabled ? undefined : handleEnd}
      onTouchMove={disabled ? undefined : handleTouchMove}
      onTouchEnd={disabled ? undefined : handleEnd}
      onTouchStart={disabled ? undefined : handleStart}
      aria-disabled={disabled}
      style={
        {
          '--rotate-x': '0deg',
          '--rotate-y': '0deg',
          '--shadow-x': '0px',
          '--shadow-y': '0px',
          '--duration': `${options?.resetDuration || 500}ms`,
          '--shadow-duration': `${options?.resetDuration || 500}ms`,
        } as React.CSSProperties
      }
    >
      {options?.shadow && !disabled && (
        <div
          className="absolute inset-0 rounded-3xl"
          style={{
            inset: '0',
            transform: `translate3d(var(--shadow-x, 0px), var(--shadow-y, 0px), 0)`,
            transition: `transform var(--shadow-duration, ${options?.resetDuration || 500}ms)`,
            background: options.shadow.color || 'rgba(0, 0, 0)',
            borderRadius: 'inherit',
            width: '100%',
            height: 'calc(100% - 44px)',
            zIndex: 0,
            opacity: options.shadow.opacity || 0.15,
            filter: `blur(12px)`,
            willChange: 'transform',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        />
      )}
      <div
        style={{
          transform:
            'perspective(1000px) rotateX(var(--rotate-x, 0deg)) rotateY(var(--rotate-y, 0deg))',
          transition: `transform var(--duration, ${options?.resetDuration || 500}ms)`,
        }}
        className={cn(
          'relative z-10 overflow-hidden will-change-transform',
          className,
        )}
      >
        <div
          style={{
            transformStyle: 'preserve-3d',
            zIndex: 1,
          }}
        >
          {children}
        </div>
        {options?.shimmer && (
          <div
            className="pointer-events-none absolute inset-0 z-30 [transform-style:preserve-3d] [transform:translateZ(5px)]"
            style={{
              opacity: 'calc(abs(var(--rotate-x)) + abs(var(--rotate-y))) / 5',
              transition: `transform var(--duration, ${options?.resetDuration || 500}ms)`,
              background: `linear-gradient(
                calc(315deg + var(--rotate-y) * 1.5), 
                rgba(120, 120, 255, 0.2) 20%, 
                rgba(255, 255, 255, 0.4) 50%, 
                rgba(255, 120, 120, 0.2) 80%
              )`,
              backgroundSize: '200% 200%',
              backgroundPosition: `calc(50% + var(--rotate-x) * 1.5) calc(50% - var(--rotate-y) * 1.5)`,
              mixBlendMode: options.shimmer.mixBlendMode || 'soft-light',
              WebkitOverflowScrolling: 'touch',
              WebkitMaskImage: '-webkit-radial-gradient(white, black)',
            }}
          />
        )}
      </div>
    </div>
  );
};
