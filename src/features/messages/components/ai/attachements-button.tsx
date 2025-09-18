import { UIMessage, UseChatHelpers } from '@ai-sdk/react';
import { PlusIcon } from 'lucide-react';
import { memo } from 'react';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

function PureAttachmentsButton({
  fileInputRef,
  status,
}: {
  fileInputRef: React.MutableRefObject<HTMLInputElement | null>;
  status: UseChatHelpers<UIMessage>['status'];
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            data-testid="attachments-button"
            className="mr-1.5 h-fit translate-y-px rounded-md rounded-bl-lg p-1.5 text-zinc-400 hover:bg-zinc-100 dark:border-zinc-700 hover:dark:bg-zinc-900"
            onClick={(event) => {
              event.preventDefault();
              fileInputRef.current?.click();
            }}
            disabled={status !== 'ready'}
            variant="ghost"
          >
            <PlusIcon size={16} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Add an attachment</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export const AttachmentsButton = memo(PureAttachmentsButton);
