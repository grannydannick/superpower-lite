import { isToolUIPart, type UIMessage } from 'ai';
import equal from 'fast-deep-equal';
import { BarChart, CopyIcon, Share, ThumbsUp, ThumbsDown } from 'lucide-react';
import { memo } from 'react';
import removeMarkdown from 'remove-markdown';

import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAnalytics } from '@/hooks/use-analytics';

import { parseMessageParts } from '../../utils/parse-message-parts';
import { ChatShareDialog } from '../chat-share-dialog';
import { CitationsDialog } from '../citations-dialog';

export function PureMessageActions({
  chatId,
  message,
  isLoading,
}: {
  chatId: string;
  message: UIMessage;
  isLoading: boolean;
}) {
  const { track } = useAnalytics();
  if (isLoading) return null;
  if (message.role === 'user') return null;

  // Check if message has any text content worth showing actions for
  const hasTextContent = message.parts.some(
    (part) => part.type === 'text' && part.text.trim().length > 0,
  );

  // Only hide if message has tool parts AND no text content
  if (message.parts.some((part) => isToolUIPart(part)) && !hasTextContent) {
    return null;
  }

  const { citations } = parseMessageParts(message, false);
  const citationsList = Array.from(citations.values()).sort(
    (a, b) => a.number - b.number,
  );

  const handleCopy = async () => {
    const textParts =
      message.parts
        ?.filter(
          (part): part is { type: 'text'; text: string } =>
            part.type === 'text' && 'text' in part,
        )
        .map((part) => part.text.trim()) || [];

    const rawContent = textParts.join(' ');

    const plainTextContent = removeMarkdown(rawContent);

    if (plainTextContent) {
      await navigator.clipboard.writeText(plainTextContent);
      toast.success('Copied to clipboard!');
      track('copied_to_clipboard_ai');
    } else {
      toast.error('No content to copy.');
    }
  };

  const handleThumbsUp = () => {
    track('message_feedback_positive', { chatId });
    toast.success('Thank you. Your feedback has been received!');
  };

  const handleThumbsDown = () => {
    track('message_feedback_negative', { chatId });
    toast.success('Thank you. Your feedback has been received!');
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div className="mt-2 flex flex-row items-center gap-0.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="flex size-8 items-center justify-center rounded-lg p-0 text-muted-foreground hover:bg-zinc-100"
              variant="ghost"
              onClick={handleCopy}
            >
              <CopyIcon size={16} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Copy</TooltipContent>
        </Tooltip>
        <Tooltip>
          <ChatShareDialog
            chatId={chatId}
            trigger={
              <TooltipTrigger asChild>
                <Button
                  className="flex size-8 items-center justify-center rounded-lg p-0 text-muted-foreground hover:bg-zinc-100"
                  variant="ghost"
                >
                  <Share size={16} />
                </Button>
              </TooltipTrigger>
            }
          />
          <TooltipContent>Share</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="flex size-8 items-center justify-center rounded-lg p-0 text-muted-foreground hover:bg-zinc-100"
              variant="ghost"
              onClick={handleThumbsUp}
            >
              <ThumbsUp size={16} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Good response</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="flex size-8 items-center justify-center rounded-lg p-0 text-muted-foreground hover:bg-zinc-100"
              variant="ghost"
              onClick={handleThumbsDown}
            >
              <ThumbsDown size={16} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Poor response</TooltipContent>
        </Tooltip>
        {citationsList.length > 0 && (
          <Tooltip>
            <CitationsDialog
              messageId={message.id}
              citations={citationsList}
              trigger={
                <TooltipTrigger asChild>
                  <Button
                    className="rounded-full px-2.5 py-1.5 hover:bg-zinc-100"
                    variant="ghost"
                  >
                    <BarChart size={16} />
                    <span className="ml-1 text-sm font-semibold leading-none">
                      {citationsList.length} Sources
                    </span>
                  </Button>
                </TooltipTrigger>
              }
            />
            <TooltipContent>See all sources</TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}

export const MessageActions = memo(
  PureMessageActions,
  (prevProps, nextProps) => {
    // Re-render if isLoading changes OR if the message content changes.
    return (
      prevProps.isLoading === nextProps.isLoading &&
      equal(prevProps.message, nextProps.message)
    );
  },
);
