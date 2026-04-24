import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useAssistantStore } from '@/features/messages/stores/assistant-store';

import { AnimatedIcon } from '../ai/animated-icon';

import { AssistantChat } from './assistant-chat';

interface AssistantChatSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMessage?: string;
}

export function AssistantChatSheet({
  open,
  onOpenChange,
  defaultMessage,
}: AssistantChatSheetProps) {
  const _sendMessage = useAssistantStore((s) => s._sendMessage);
  const sentRef = useRef(false);
  const openSendMessageRef = useRef(_sendMessage);
  const prevOpenRef = useRef(open);

  if (open && !prevOpenRef.current) {
    sentRef.current = false;
    openSendMessageRef.current = _sendMessage;
  }
  prevOpenRef.current = open;

  // Auto-send once the sheet's AssistantChat registers its own sendMessage
  // (detected by _sendMessage changing from what it was when the sheet opened)
  useEffect(() => {
    if (
      open &&
      defaultMessage &&
      _sendMessage &&
      !sentRef.current &&
      _sendMessage !== openSendMessageRef.current
    ) {
      _sendMessage({ text: defaultMessage, files: [] });
      sentRef.current = true;
    }
  }, [open, defaultMessage, _sendMessage]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="flex flex-col rounded-t-2xl"
        preventCloseAutoFocus
      >
        <SheetHeader className="px-4 pb-2 pt-4">
          <div className="flex items-center gap-2">
            <AnimatedIcon state="idle" className="size-5" />
            <SheetTitle>Superpower AI</SheetTitle>
          </div>
        </SheetHeader>
        <SheetClose asChild className="absolute right-4 top-4 z-10">
          <div className="flex h-[44px] min-w-[44px] cursor-pointer items-center justify-center rounded-full">
            <X className="h-4 min-w-4" />
          </div>
        </SheetClose>
        <div className="min-h-0 flex-1 overflow-hidden px-2 pb-4">
          <AssistantChat isActive={open} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
