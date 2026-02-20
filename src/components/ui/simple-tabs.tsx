import * as TabsPrimitive from '@radix-ui/react-tabs';
import * as React from 'react';

import { cn } from '@/lib/utils';

const Tabs = TabsPrimitive.Root;

const SimpleTabsList = React.memo(
  React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.List>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
  >(({ className, ...props }, ref) => {
    const [indicatorStyle, setIndicatorStyle] = React.useState({
      width: 0,
      left: 0,
      opacity: 0,
    });

    const tabsRef = React.useRef<HTMLDivElement | null>(null);
    const animationFrameRef = React.useRef<number>();

    const updateIndicatorPosition = React.useCallback(() => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      animationFrameRef.current = requestAnimationFrame(() => {
        if (!tabsRef.current) return;

        const activeTab = tabsRef.current.querySelector(
          '[data-state="active"]',
        ) as HTMLElement;

        if (!activeTab) {
          setIndicatorStyle((prev) => ({ ...prev, opacity: 0 }));
          return;
        }

        const newStyle = {
          width: activeTab.offsetWidth + 8,
          left: activeTab.offsetLeft - 4,
          opacity: 1,
        };

        setIndicatorStyle((prevStyle) => {
          if (
            prevStyle.width === newStyle.width &&
            prevStyle.left === newStyle.left &&
            prevStyle.opacity === newStyle.opacity
          ) {
            return prevStyle;
          }
          return newStyle;
        });
      });
    }, []);

    React.useEffect(() => {
      updateIndicatorPosition();
    }, [updateIndicatorPosition]);

    React.useEffect(() => {
      if (!tabsRef.current) return;

      const observer = new MutationObserver((mutations) => {
        const hasStateChange = mutations.some(
          (mutation) =>
            mutation.type === 'attributes' &&
            mutation.attributeName === 'data-state',
        );

        if (hasStateChange) {
          updateIndicatorPosition();
        }
      });

      observer.observe(tabsRef.current, {
        attributes: true,
        attributeFilter: ['data-state'],
        subtree: true,
      });

      return () => {
        observer.disconnect();
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }, [updateIndicatorPosition]);

    const combinedRef = React.useCallback(
      (node: HTMLDivElement | null) => {
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
        tabsRef.current = node;
      },
      [ref],
    );

    return (
      <div className="relative">
        <TabsPrimitive.List
          ref={combinedRef}
          className={cn(
            'inline-flex h-8 items-center justify-center gap-2 rounded-md p-1 text-zinc-500',
            className,
          )}
          {...props}
        />

        <div
          className="pointer-events-none absolute top-0 h-full rounded-full bg-zinc-100 transition-all duration-200 ease-in-out"
          style={{
            width: `${indicatorStyle.width}px`,
            left: `${indicatorStyle.left}px`,
            opacity: indicatorStyle.opacity,
          }}
        />
      </div>
    );
  }),
);
SimpleTabsList.displayName = 'SimpleTabsList';

const SimpleTabsTrigger = React.memo(
  React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.Trigger>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
  >(({ className, ...props }, ref) => (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        'relative z-10 inline-flex items-center justify-center whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        'data-[state=active]:text-zinc-900',
        'hover:text-zinc-700',
        className,
      )}
      {...props}
    />
  )),
);
SimpleTabsTrigger.displayName = 'SimpleTabsTrigger';

const SimpleTabsContent = React.memo(
  React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
  >(({ className, ...props }, ref) => (
    <TabsPrimitive.Content
      ref={ref}
      className={cn(
        'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'data-[state=inactive]:hidden',
        'data-[state=active]:duration-150 data-[state=active]:animate-in data-[state=active]:fade-in',
        className,
      )}
      {...props}
    />
  )),
);
SimpleTabsContent.displayName = 'SimpleTabsContent';

const SimpleTabs = React.memo(
  React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root> & {
      tabs: { label: string; value: string }[];
      defaultTab: string;
      children?: React.ReactNode;
    }
  >(({ tabs, defaultTab, className, children, ...props }, ref) => {
    const memoizedTabs = React.useMemo(
      () =>
        tabs.map((tab) => (
          <SimpleTabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </SimpleTabsTrigger>
        )),
      [tabs],
    );

    return (
      <Tabs
        ref={ref}
        className={className}
        defaultValue={defaultTab}
        {...props}
      >
        <SimpleTabsList>{memoizedTabs}</SimpleTabsList>
        {children}
      </Tabs>
    );
  }),
);
SimpleTabs.displayName = 'SimpleTabs';

export { SimpleTabs, SimpleTabsContent };
