import * as TabsPrimitive from '@radix-ui/react-tabs';
import {
  ComponentPropsWithoutRef,
  ElementRef,
  forwardRef,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { cn } from '@/lib/utils';

const Tabs = TabsPrimitive.Root;

const TabsList = forwardRef<
  ElementRef<typeof TabsPrimitive.List>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.List> & {
    hidden?: boolean;
  }
>(({ className, hidden = false, ...props }, ref) => {
  const [indicatorStyle, setIndicatorStyle] = useState({
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  });
  const [activeValue, setActiveValue] = useState<string | null>(null);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const activeNodeRef = useRef<HTMLElement | null>(null);
  const hasMeasuredRef = useRef(false);
  const tabsRef = useRef<HTMLDivElement | null>(null);

  const updateIndicatorPosition = useCallback(() => {
    if (!tabsRef.current) {
      return;
    }

    const activeTab = tabsRef.current.querySelector(
      '[data-state="active"]',
    ) as HTMLElement | null;

    if (!activeTab) {
      activeNodeRef.current = null;
      setActiveValue((prev) => (prev === null ? prev : null));
      setIndicatorStyle({
        width: 0,
        height: 0,
        x: 0,
        y: 0,
      });
      setShouldAnimate(false);
      hasMeasuredRef.current = false;
      return;
    }

    // Use offset properties instead of getBoundingClientRect — they are
    // immune to CSS transforms (e.g. dialog/sheet scale animations) so
    // the indicator pill is positioned correctly even on first render.
    if (activeNodeRef.current !== activeTab) {
      activeNodeRef.current = activeTab;
      const value = activeTab.getAttribute('data-value');
      setActiveValue((prev) => (prev === value ? prev : value));
      if (hasMeasuredRef.current) {
        setShouldAnimate(true);
      } else {
        hasMeasuredRef.current = true;
      }
    } else if (!hasMeasuredRef.current) {
      hasMeasuredRef.current = true;
      setShouldAnimate(false);
    }

    setIndicatorStyle({
      width: activeTab.offsetWidth,
      height: activeTab.offsetHeight,
      x: activeTab.offsetLeft,
      y: activeTab.offsetTop,
    });
  }, []);

  useLayoutEffect(() => {
    if (!tabsRef.current) {
      return;
    }

    const tabsElement = tabsRef.current;

    // Measure synchronously in useLayoutEffect so React re-renders
    // before the browser paints — the indicator appears at the correct
    // position on the very first frame. This is safe because we use
    // offset* properties which are immune to CSS transforms.
    updateIndicatorPosition();

    const mutationObserver = new MutationObserver(() => {
      updateIndicatorPosition();
    });

    mutationObserver.observe(tabsElement, {
      attributes: true,
      subtree: true,
      attributeFilter: ['data-state'],
    });

    let resizeObserver: ResizeObserver | null = null;

    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        updateIndicatorPosition();
      });

      resizeObserver.observe(tabsElement);

      if (activeNodeRef.current) {
        resizeObserver.observe(activeNodeRef.current);
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', updateIndicatorPosition);
    }

    return () => {
      mutationObserver.disconnect();
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', updateIndicatorPosition);
      }
    };
  }, [activeValue, updateIndicatorPosition]);

  return (
    <div className="relative">
      <TabsPrimitive.List
        ref={(node) => {
          if (typeof ref === 'function') ref(node);
          else if (ref) (ref as any).current = node;
          tabsRef.current = node;
        }}
        className={cn(
          'relative inline-flex items-center gap-2 rounded-full bg-[#f4f4f5] py-1 pl-1 pr-[5px]',
          className,
        )}
        {...props}
      />

      {/* Active pill background */}
      {!hidden && (
        <div
          className={cn(
            'pointer-events-none absolute left-0 top-0 rounded-full bg-white',
          )}
          style={{
            width: `${indicatorStyle.width}px`,
            height: `${indicatorStyle.height}px`,
            transform: `translate3d(${indicatorStyle.x}px, ${indicatorStyle.y}px, 0)`,
            transition: shouldAnimate
              ? 'transform 250ms cubic-bezier(0.22, 1, 0.36, 1), width 250ms cubic-bezier(0.22, 1, 0.36, 1), height 250ms cubic-bezier(0.22, 1, 0.36, 1)'
              : 'none',
          }}
        />
      )}
    </div>
  );
});
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = forwardRef<
  ElementRef<typeof TabsPrimitive.Trigger>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'relative z-10 inline-flex items-center justify-center whitespace-nowrap rounded-full px-4 py-1.5 text-base font-medium transition-all duration-200',
      'gap-2 text-secondary data-[state=active]:text-primary hover:text-primary',
      'disabled:pointer-events-none disabled:text-secondary/60 disabled:opacity-70 disabled:hover:text-secondary/60',
      'data-[disabled]:pointer-events-none data-[disabled]:text-secondary/60 data-[disabled]:opacity-70 data-[disabled]:hover:text-secondary/60',
      className,
    )}
    {...props}
  >
    {children}
  </TabsPrimitive.Trigger>
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = forwardRef<
  ElementRef<typeof TabsPrimitive.Content>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      'data-[state=inactive]:hidden',
      'data-[state=active]:duration-150 data-[state=active]:animate-in data-[state=active]:fade-in',
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsContent, TabsList, TabsTrigger };
