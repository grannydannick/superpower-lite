import type { Message } from 'ai';
import { CopyIcon } from 'lucide-react';
import { memo } from 'react';

import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function PureMessageActions({
  message,
  isLoading,
}: {
  chatId: string;
  message: Message;
  isLoading: boolean;
}) {
  if (isLoading) return null;
  if (message.role === 'user') return null;
  if (message.toolInvocations && message.toolInvocations.length > 0)
    return null;

  return (
    <TooltipProvider delayDuration={0}>
      <div className="mt-2 flex flex-row gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="h-fit p-0 text-muted-foreground"
              variant="ghost"
              onClick={async () => {
                await navigator.clipboard.writeText(message.content);
                toast.success('Copied to clipboard!');
              }}
            >
              <CopyIcon size={16} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Copy</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

export const MessageActions = memo(
  PureMessageActions,
  (prevProps, nextProps) => {
    if (prevProps.isLoading !== nextProps.isLoading) return false;

    return true;
  },
);
