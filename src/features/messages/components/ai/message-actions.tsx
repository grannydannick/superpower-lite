import { isToolOrDynamicToolUIPart, type UIMessage } from 'ai';
import equal from 'fast-deep-equal';
import { CopyIcon } from 'lucide-react';
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

export function PureMessageActions({
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
  if (message.parts.some((part) => isToolOrDynamicToolUIPart(part)))
    return null;

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

  return (
    <TooltipProvider delayDuration={0}>
      <div className="mt-2 flex flex-row gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="h-fit p-0 text-muted-foreground"
              variant="ghost"
              onClick={handleCopy}
              disabled={isLoading}
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
    // Re-render if isLoading changes OR if the message content changes.
    return (
      prevProps.isLoading === nextProps.isLoading &&
      equal(prevProps.message, nextProps.message)
    );
  },
);
