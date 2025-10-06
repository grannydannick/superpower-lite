import { ChevronsDownUp, PictureInPicture } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Resizable } from 'react-resizable';
import 'react-resizable/css/styles.css';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { AnimatedIcon } from '@/features/messages/components/ai/animated-icon';
import { cn } from '@/lib/utils';
import { generateUUID } from '@/utils/generate-uiud';

import { AssistantChat } from './assistant-chat';

export const AssistantModal = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [height, setHeight] = useState<number>(() =>
    typeof window !== 'undefined'
      ? Math.max(320, Math.round(window.innerHeight * 0.5))
      : 512,
  );
  const [isResizing, setIsResizing] = useState(false);
  const collapsedHeight = 48; // equals Tailwind h-12
  const navigate = useNavigate();
  const chatId = useMemo(() => generateUUID(), []);
  const boxHeight = isExpanded ? height : collapsedHeight;

  return (
    /* We use the following as an interactive div with the role of a button when not expanded for accessibility */
    /* eslint-disable-next-line jsx-a11y/click-events-have-key-events */
    <Resizable
      width={100}
      height={boxHeight}
      axis={isExpanded ? 'y' : 'none'}
      resizeHandles={isExpanded ? ['n'] : []}
      handle={(axis, ref) =>
        // we define a slightly bigger handle for better accessibility
        axis === 'n' ? (
          <div
            ref={ref as any}
            className="absolute inset-x-0 -top-1 h-6 w-full cursor-ns-resize bg-transparent"
          />
        ) : null
      }
      handleSize={[10, 12]}
      minConstraints={[0, 240]}
      maxConstraints={[
        Infinity,
        typeof window !== 'undefined'
          ? Math.round(window.innerHeight * 0.9)
          : 1024,
      ]}
      draggableOpts={{ enableUserSelectHack: true }}
      onResizeStart={() => setIsResizing(true)}
      onResizeStop={() => setIsResizing(false)}
      onResize={(_e, { size }) => setHeight(size.height)}
    >
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events */}
      <div
        role={!isExpanded ? 'button' : undefined}
        tabIndex={!isExpanded ? 0 : -1}
        aria-expanded={isExpanded}
        onClick={() => {
          if (!isExpanded) setIsExpanded(true);
        }}
        className={cn(
          'relative flex gap-2 flex-col border border-zinc-200 bg-white px-4 py-3 shadow-lg shadow-black/[.07] transition-all ease-out duration-200',
          isExpanded
            ? 'lg:w-96 pb-2 rounded-3xl w-[calc(100vw-2rem)] items-start cursor-default'
            : 'items-center rounded-xl justify-center w-52 cursor-pointer hover:bg-zinc-50',
          isResizing && 'select-none',
        )}
        style={{
          height: boxHeight,
          transitionProperty: isResizing
            ? 'background-color,border-color,color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter'
            : undefined,
        }}
      >
        <div className="flex w-full items-center justify-between gap-4">
          <div className="flex shrink-0 items-center gap-2">
            <AnimatedIcon state="idle" />
            Ask Superpower AI
          </div>
          <div
            className={cn(
              'flex items-center gap-0.5 overflow-hidden transition-all duration-200 ease-out',
              isExpanded ? 'max-w-20' : 'max-w-0 pointer-events-none',
            )}
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Button
                    onClick={() => {
                      navigate(`/concierge/${chatId}`);
                      setIsExpanded(false);
                    }}
                    variant="white"
                    className="aspect-square rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-primary"
                  >
                    <PictureInPicture className="size-4 rotate-180 -scale-x-100" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Full Screen</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger>
                  <Button
                    onClick={() => setIsExpanded(false)}
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
          <AssistantChat chatId={chatId} />
        </div>
      </div>
    </Resizable>
  );
};
