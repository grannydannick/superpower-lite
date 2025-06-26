import * as TabsPrimitive from '@radix-ui/react-tabs';
import * as React from 'react';
import { useSearchParams } from 'react-router-dom';

import { cn } from '@/lib/utils';

const Tabs = TabsPrimitive.Root;

const URLTabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root> & {
    paramName?: string;
    defaultTab?: string;
  }
>(
  (
    { paramName = 'tab', defaultTab = 'all', className, children, ...props },
    ref,
  ) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const currentTab = searchParams.get(paramName) || defaultTab;

    const handleTabChange = (value: string) => {
      setSearchParams((params) => {
        if (value === defaultTab) {
          params.delete(paramName);
        } else {
          params.set(paramName, value);
        }
        return params;
      });
    };

    return (
      <TabsPrimitive.Root
        ref={ref}
        value={currentTab}
        onValueChange={handleTabChange}
        className={className}
        {...props}
      >
        {children}
      </TabsPrimitive.Root>
    );
  },
);
URLTabs.displayName = 'URLTabs';

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => {
  const [activeTabElement, setActiveTabElement] =
    React.useState<HTMLElement | null>(null);
  const [indicatorStyle, setIndicatorStyle] = React.useState({
    width: 0,
    left: 0,
    top: 0,
    height: 0,
  });
  const [isInitialLoad, setIsInitialLoad] = React.useState(true);
  const tabsRef = React.useRef<HTMLDivElement | null>(null);

  const updateIndicatorPosition = React.useCallback(() => {
    if (tabsRef.current) {
      const activeTab = tabsRef.current.querySelector('[data-state="active"]');
      if (activeTab) {
        setActiveTabElement(activeTab as HTMLElement);
        if (isInitialLoad) {
          setTimeout(() => setIsInitialLoad(false), 50);
        }
      }
    }
  }, [isInitialLoad]);

  React.useEffect(() => {
    if (activeTabElement && tabsRef.current) {
      const tabRect = activeTabElement.getBoundingClientRect();
      const tabsRect = tabsRef.current.getBoundingClientRect();

      setIndicatorStyle({
        width: tabRect.width,
        left: tabRect.left - tabsRect.left,
        top: tabRect.bottom - tabsRect.top,
        height: 2,
      });
    }
  }, [activeTabElement]);

  React.useEffect(() => {
    updateIndicatorPosition();

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'data-state'
        ) {
          updateIndicatorPosition();
        }
      });
    });

    if (tabsRef.current) {
      observer.observe(tabsRef.current, {
        attributes: true,
        subtree: true,
        attributeFilter: ['data-state'],
      });
    }

    return () => {
      observer.disconnect();
    };
  }, [updateIndicatorPosition]);

  return (
    <div className="relative">
      <TabsPrimitive.List
        ref={(node) => {
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
          tabsRef.current = node;
        }}
        className={cn(
          'inline-flex flex-wrap gap-4 items-center justify-center bg-transparent p-1 text-zinc-300',
          className,
        )}
        {...props}
      />

      <div
        className={cn(
          'absolute h-0.5 bg-black transition-all duration-150 ease-in-out',
          isInitialLoad ? 'opacity-0' : 'opacity-100',
        )}
        style={{
          width: `${indicatorStyle.width}px`,
          left: `${indicatorStyle.left}px`,
          top: `${indicatorStyle.top + 6}px`,
          height: `${indicatorStyle.height}px`,
          transitionProperty: 'opacity, width, left, top',
        }}
      />
      <div className="absolute bottom-[-5px] left-1/2 h-px w-screen -translate-x-1/2 bg-zinc-200" />
    </div>
  );
});
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'inline-flex items-center transition-colors duration-200 hover:text-zinc-400 justify-center whitespace-nowrap text-base md:text-xl font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
      'data-[state=active]:text-zinc-900 data-[state=active]:hover:text-zinc-900',
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      'data-[state=inactive]:hidden',
      'data-[state=active]:animate-in data-[state=active]:fade-in data-[state=active]:duration-150',
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsContent, TabsList, TabsTrigger, URLTabs };
