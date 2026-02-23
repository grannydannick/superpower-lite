import { ChevronsDownUp, Link, Maximize2, Minimize2 } from 'lucide-react';
import {
  Suspense,
  lazy,
  useCallback,
  useMemo,
  useState,
  type Ref,
} from 'react';
import { Resizable } from 'react-resizable';

import 'react-resizable/css/styles.css';
import { CircleAiIcon } from '@/components/icons/circle-ai-icon';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  getDefaultAssistantSize,
  useResizeAssistant,
} from '@/features/messages/hooks/use-resize-assistant';
import { useAssistantStore } from '@/features/messages/stores/assistant-store';
import { cn } from '@/lib/utils';

const AnimatedIcon = lazy(() =>
  import('@/features/messages/components/ai/animated-icon').then((mod) => ({
    default: mod.AnimatedIcon,
  })),
);

const AssistantChat = lazy(() =>
  import('./assistant-chat').then((mod) => ({
    default: mod.AssistantChat,
  })),
);

export const AssistantModal = () => {
  const isExpanded = useAssistantStore((s) => s.isExpanded);
  const open = useAssistantStore((s) => s.open);
  const close = useAssistantStore((s) => s.close);
  const input = useAssistantStore((s) => s.input);
  const { width, height, setSize, minConstraints, maxConstraints } =
    useResizeAssistant();

  const [isResizing, setIsResizing] = useState(false);
  const collapsedHeight = 48; // equals Tailwind h-12
  const chatId = useMemo(() => crypto.randomUUID(), []);
  const boxHeight = isExpanded ? height : collapsedHeight;
  const boxWidth = isExpanded ? width : undefined;

  const handleCopyLinkClick = useCallback(async () => {
    const trimmedMessage = input == null ? '' : input.trim();
    let q = '';
    if (trimmedMessage.length > 0) {
      q = `?defaultMessage=${encodeURIComponent(trimmedMessage)}`;
    }
    const url = `${window.location.origin}/concierge/${chatId}${q}`;

    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard');
    } catch (err) {
      console.error('Failed to copy link:', err);
      toast.error('Failed to copy link');
    }
  }, [chatId, input]);

  const isMaximized = useMemo(() => {
    return width === maxConstraints[0] && height === maxConstraints[1];
  }, [width, height, maxConstraints]);

  const handleMaximizeToggle = useCallback(() => {
    if (isMaximized) {
      const defaultSize = getDefaultAssistantSize();
      setSize(defaultSize);
    } else {
      setSize({ width: maxConstraints[0], height: maxConstraints[1] });
    }
  }, [isMaximized, maxConstraints, setSize]);

  return (
    <Resizable
      width={isExpanded ? width : 100}
      height={boxHeight}
      axis={isExpanded ? 'both' : 'none'}
      resizeHandles={isExpanded ? ['n', 'w', 'nw'] : []}
      handle={(axis, ref) => {
        // slightly bigger handles for better accessibility
        if (axis === 'n') {
          return (
            <div
              // top ghost element to resize
              ref={ref as unknown as Ref<HTMLDivElement>}
              className="absolute inset-x-0 -top-1 h-4 w-full cursor-ns-resize bg-transparent"
            />
          );
        }
        if (axis === 'w') {
          return (
            <div
              // left direction ghost element to resize
              ref={ref as unknown as Ref<HTMLDivElement>}
              className="absolute inset-y-0 -left-1 h-full w-3 cursor-ew-resize bg-transparent"
            />
          );
        }
        if (axis === 'nw') {
          return (
            <div
              // top left ghost element to resize
              ref={ref as unknown as Ref<HTMLDivElement>}
              className="absolute -left-1 -top-1 size-4 cursor-nwse-resize bg-transparent"
            />
          );
        }
        return null;
      }}
      handleSize={[10, 12]}
      minConstraints={[minConstraints[0], minConstraints[1]]}
      maxConstraints={[maxConstraints[0], maxConstraints[1]]}
      draggableOpts={{ enableUserSelectHack: true }}
      onResizeStart={() => setIsResizing(true)}
      onResizeStop={() => setIsResizing(false)}
      onResize={(_e, { size }) => setSize(size)}
    >
      <div
        role="button"
        tabIndex={!isExpanded ? 0 : -1}
        aria-expanded={isExpanded}
        onClick={!isExpanded ? () => open() : undefined}
        onKeyDown={
          !isExpanded
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  open();
                }
              }
            : undefined
        }
        className={cn(
          'pointer-events-auto relative hidden flex-col gap-2 border border-zinc-200 bg-white px-4 py-3 shadow-lg shadow-black/[.07] transition-all duration-200 ease-out lg:flex',
          isExpanded
            ? 'cursor-default items-start rounded-3xl pb-2'
            : 'w-52 cursor-pointer items-center justify-center rounded-xl hover:bg-zinc-50',
          isResizing &&
            'select-none border-vermillion-900/50 ring-2 ring-vermillion-900/5',
        )}
        style={{
          height: boxHeight,
          width: boxWidth,
          transitionProperty: isResizing
            ? 'background-color,border-color,color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter'
            : undefined,
        }}
      >
        <div className="flex w-full items-center justify-between gap-4">
          <div className="flex shrink-0 items-center gap-2">
            {isExpanded ? (
              <Suspense
                fallback={<CircleAiIcon size={24} className="text-current" />}
              >
                <AnimatedIcon state="idle" />
              </Suspense>
            ) : (
              <CircleAiIcon size={24} className="text-current" />
            )}
            Ask Superpower AI
          </div>
          <div
            className={cn(
              'flex items-center gap-0.5 overflow-hidden transition-all duration-200 ease-out',
              isExpanded ? 'max-w-32' : 'pointer-events-none max-w-0',
            )}
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleMaximizeToggle}
                    variant="white"
                    className="aspect-square rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-primary"
                  >
                    {isMaximized ? (
                      <Minimize2 className="size-4" />
                    ) : (
                      <Maximize2 className="size-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isMaximized ? 'Shrink' : 'Maximize'}
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleCopyLinkClick}
                    variant="white"
                    className="aspect-square rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-primary"
                  >
                    <Link className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Copy link to chat</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => close()}
                    variant="white"
                    className="aspect-square rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-primary"
                  >
                    <ChevronsDownUp className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Close overlay</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        <div className={cn('min-h-0 w-full flex-1', !isExpanded && 'hidden')}>
          {isExpanded ? (
            <Suspense fallback={null}>
              <AssistantChat
                chatId={chatId}
                isActive={isExpanded}
                isResizing={isResizing}
              />
            </Suspense>
          ) : null}
        </div>
      </div>
    </Resizable>
  );
};
