import {
  formatDistanceToNow,
  isToday,
  isYesterday,
  subMonths,
  subWeeks,
} from 'date-fns';
import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Dialog, DialogContent, DialogOverlay } from '@/components/ui/dialog';
import { useHistory } from '@/features/messages/api/get-history';
import { Chat } from '@/types/api';

type GroupedChats = {
  today: Chat[];
  yesterday: Chat[];
  lastWeek: Chat[];
  lastMonth: Chat[];
  older: Chat[];
};

const groupChatsByDate = (chats: Chat[]): GroupedChats => {
  const now = new Date();
  const oneWeekAgo = subWeeks(now, 1);
  const oneMonthAgo = subMonths(now, 1);

  return chats.reduce(
    (groups, chat) => {
      const chatDate = new Date(chat.createdAt);

      if (isToday(chatDate)) {
        groups.today.push(chat);
      } else if (isYesterday(chatDate)) {
        groups.yesterday.push(chat);
      } else if (chatDate > oneWeekAgo) {
        groups.lastWeek.push(chat);
      } else if (chatDate > oneMonthAgo) {
        groups.lastMonth.push(chat);
      } else {
        groups.older.push(chat);
      }

      return groups;
    },
    {
      today: [],
      yesterday: [],
      lastWeek: [],
      lastMonth: [],
      older: [],
    } as GroupedChats,
  );
};

const formatRelativeTime = (date: Date): string => {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

interface ChatSearchCommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChatSearchCommand({
  open,
  onOpenChange,
}: ChatSearchCommandProps) {
  const navigate = useNavigate();
  const { data: history } = useHistory();

  // Global ⌘K / Ctrl+K listener
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    },
    [open, onOpenChange],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleSelect = (chatId: string) => {
    onOpenChange(false);
    navigate(`/concierge/${chatId}`);
  };

  const groupedChats = groupChatsByDate(history ?? []);

  const groups: { label: string; chats: Chat[] }[] = [
    { label: 'Today', chats: groupedChats.today },
    { label: 'Yesterday', chats: groupedChats.yesterday },
    { label: 'Last 7 days', chats: groupedChats.lastWeek },
    { label: 'Last 30 days', chats: groupedChats.lastMonth },
    { label: 'Older', chats: groupedChats.older },
  ].filter((group) => group.chats.length > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogOverlay className="z-[60]" />
      <DialogContent
        isStacked
        className="z-[60] max-w-[calc(100%-1rem)] overflow-hidden rounded-[14px] p-0 shadow-lg md:max-w-3xl"
      >
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:size-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:size-5">
          <CommandInput placeholder="Search conversations..." />
          <CommandList className="max-h-80 pb-1">
            <CommandEmpty>No conversations found.</CommandEmpty>
            {groups.map((group) => (
              <CommandGroup key={group.label} heading={group.label}>
                {group.chats.map((chat) => (
                  <CommandItem
                    key={chat.id}
                    value={chat.title}
                    onSelect={() => handleSelect(chat.id)}
                    className="flex cursor-pointer items-center justify-between gap-4"
                  >
                    <span className="truncate text-sm">{chat.title}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatRelativeTime(chat.createdAt)}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
