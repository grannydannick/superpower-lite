import { IconEditSmall1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconEditSmall1';
import { IconMagnifyingGlass } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconMagnifyingGlass';
import { IconSidebarSimpleLeftSquare } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconSidebarSimpleLeftSquare';
import { Link, useNavigate, useParams } from '@tanstack/react-router';
import { isToday, isYesterday, subMonths, subWeeks } from 'date-fns';
import { AnimatePresence, m } from 'framer-motion';
import { MoreHorizontalIcon } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Body3, H3 } from '@/components/ui/typography';
import { useDeleteChat } from '@/features/messages/api/delete-chat';
import { useHistory } from '@/features/messages/api/get-history';
import { CareTeamDialog } from '@/features/messages/components/care-team-dialog';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';
import { cn } from '@/lib/utils';
import { Chat } from '@/types/api';

import { scrollToBottom } from '../../utils/scroll-to-bottom';

import { ChatSearchCommand } from './chat-search-command';

type GroupedChats = {
  today: Chat[];
  yesterday: Chat[];
  lastWeek: Chat[];
  lastMonth: Chat[];
  older: Chat[];
};

const sidebarItemVariants = {
  open: { opacity: 1, filter: 'blur(0px)', transition: { duration: 0.25 } },
  closed: { opacity: 0, filter: 'blur(2px)', transition: { duration: 0.15 } },
};

const ChatItem = ({ chat, isActive }: { chat: Chat; isActive: boolean }) => {
  const params = useParams({ strict: false });
  const id = params.id;
  const navigate = useNavigate();

  const deleteChatMutation = useDeleteChat({
    mutationConfig: {
      onSuccess: () => {
        if (chat.id === id) {
          void navigate({ to: '/concierge' });
        }
      },
    },
  });

  return (
    <Link
      to="/concierge/$id"
      params={{ id: chat.id }}
      resetScroll={false}
      className={cn(
        'group flex w-full justify-between gap-2 rounded-xl px-4 py-2.5 text-slate-600 transition-all duration-200 ease-out hover:text-slate-900',
        isActive ? 'bg-zinc-200/60' : 'hover:bg-zinc-100',
      )}
      onClick={() => {
        scrollToBottom();
      }}
    >
      <span
        className={cn(
          'line-clamp-1 text-sm transition-all duration-150 ease-in-out',
          isActive ? 'text-black' : 'text-secondary group-hover:text-zinc-900',
        )}
      >
        {chat.title}
      </span>

      <DropdownMenu modal={true}>
        <DropdownMenuTrigger
          onClick={(e) => e.preventDefault()}
          className="transition-opacity duration-150 group-hover:opacity-100 lg:opacity-0"
        >
          <MoreHorizontalIcon
            size={16}
            className="text-zinc-400 hover:text-zinc-700"
          />
          <span className="sr-only">More</span>
        </DropdownMenuTrigger>

        <DropdownMenuContent side="bottom" align="end" className="z-[50]">
          <DropdownMenuItem
            className="cursor-pointer text-pink-700 focus:bg-pink-50 focus:text-pink-700"
            onSelect={() => {
              deleteChatMutation.mutate({ chatId: chat.id });
            }}
          >
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Link>
  );
};

export function ChatHistoryContainer({ className }: { className?: string }) {
  const params = useParams({ strict: false });
  const id = params.id;
  const navigate = useNavigate();
  const { data: history, isLoading } = useHistory();

  const [isOpen, setIsOpen] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);

  if (isLoading) {
    return <LoadingChatItem />;
  }

  if (!history || history?.length === 0) {
    return (
      <div className="flex w-full max-w-[259px] flex-col gap-4 text-sm text-zinc-500">
        Your conversations will appear here once you start chatting!
      </div>
    );
  }

  const groupedChats = groupChatsByDate(history);

  return (
    <>
      <ChatHistorySidebar
        className={className}
        groupedChats={groupedChats}
        activeChatId={id}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        onNewChat={() => {
          void navigate({ to: '/concierge' });
        }}
        onOpenSearch={() => setSearchOpen(true)}
      />
      <ChatSearchCommand open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}

function groupChatsByDate(chats: Chat[]): GroupedChats {
  const now = new Date();
  const oneWeekAgo = subWeeks(now, 1);
  const oneMonthAgo = subMonths(now, 1);

  const groups: GroupedChats = {
    today: [],
    yesterday: [],
    lastWeek: [],
    lastMonth: [],
    older: [],
  };

  for (const chat of chats) {
    const chatDate = new Date(chat.createdAt);

    if (isToday(chatDate)) {
      groups.today.push(chat);
      continue;
    }

    if (isYesterday(chatDate)) {
      groups.yesterday.push(chat);
      continue;
    }

    if (chatDate > oneWeekAgo) {
      groups.lastWeek.push(chat);
      continue;
    }

    if (chatDate > oneMonthAgo) {
      groups.lastMonth.push(chat);
      continue;
    }

    groups.older.push(chat);
  }

  return groups;
}

interface ChatHistorySidebarProps {
  className: string | undefined;
  groupedChats: GroupedChats;
  activeChatId: string | undefined;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onNewChat: () => void;
  onOpenSearch: () => void;
}

function ChatHistorySidebar({
  className,
  groupedChats,
  activeChatId,
  isOpen,
  setIsOpen,
  onNewChat,
  onOpenSearch,
}: ChatHistorySidebarProps) {
  return (
    <div
      className={cn(
        'relative lg:shrink-0 lg:transition-[max-width] lg:duration-500 lg:ease-in-out',
        isOpen ? 'lg:max-w-[259px]' : 'lg:max-w-10',
      )}
    >
      <ChatHistoryCollapsedBar
        isOpen={isOpen}
        onOpenSidebar={() => setIsOpen(true)}
        onNewChat={onNewChat}
        hasActiveChat={activeChatId !== undefined}
        onOpenSearch={onOpenSearch}
      />

      <ChatHistoryExpandedSidebar
        className={className}
        groupedChats={groupedChats}
        activeChatId={activeChatId}
        isOpen={isOpen}
        onCloseSidebar={() => setIsOpen(false)}
        onNewChat={onNewChat}
        onOpenSearch={onOpenSearch}
      />
    </div>
  );
}

function ChatHistoryCollapsedBar({
  isOpen,
  onOpenSidebar,
  onNewChat,
  hasActiveChat,
  onOpenSearch,
}: {
  isOpen: boolean;
  onOpenSidebar: () => void;
  onNewChat: () => void;
  hasActiveChat: boolean;
  onOpenSearch: () => void;
}) {
  return (
    <div className="absolute left-0 top-0 hidden w-10 flex-col items-center gap-3 pt-1 lg:flex">
      <AnimatePresence>
        {!isOpen && (
          <>
            <m.div
              key="sidebar-toggle"
              initial={{ opacity: 0, filter: 'blur(2px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, transition: { duration: 0 } }}
              transition={{ duration: 0.25, delay: 0.15 }}
            >
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-md p-1 text-zinc-400 hover:text-zinc-700"
                      onClick={onOpenSidebar}
                    >
                      <IconSidebarSimpleLeftSquare
                        size={16}
                        className="[&_path]:stroke-2"
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Show Sidebar</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </m.div>
            <m.div
              key="new-chat"
              initial={{ opacity: 0, filter: 'blur(2px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, transition: { duration: 0 } }}
              transition={{ duration: 0.25, delay: 0.2 }}
            >
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={!hasActiveChat}
                      className="rounded-md p-1 text-zinc-400 hover:text-zinc-700"
                      onClick={onNewChat}
                    >
                      <IconEditSmall1 size={16} className="[&_path]:stroke-2" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">New Chat</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </m.div>
            <m.div
              key="care-team"
              initial={{ opacity: 0, filter: 'blur(2px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, transition: { duration: 0 } }}
              transition={{ duration: 0.25, delay: 0.25 }}
            >
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <CareTeamDialog
                    trigger={
                      <TooltipTrigger asChild>
                        <button className="rounded-full transition-opacity hover:opacity-80">
                          <img
                            className="size-5 rounded-full object-cover"
                            src="/services/doctors/doc_1.webp"
                            alt="Text Care Team"
                          />
                        </button>
                      </TooltipTrigger>
                    }
                  />
                  <TooltipContent side="right">Text Care Team</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </m.div>
            <m.div
              key="search"
              initial={{ opacity: 0, filter: 'blur(2px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, transition: { duration: 0 } }}
              transition={{ duration: 0.25, delay: 0.3 }}
            >
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-md p-1 text-zinc-400 hover:text-zinc-700"
                      onClick={onOpenSearch}
                    >
                      <IconMagnifyingGlass
                        size={16}
                        className="[&_path]:stroke-2"
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Search (⌘K)</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </m.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function ChatHistoryExpandedSidebar({
  className,
  groupedChats,
  activeChatId,
  isOpen,
  onCloseSidebar,
  onNewChat,
  onOpenSearch,
}: {
  className: string | undefined;
  groupedChats: GroupedChats;
  activeChatId: string | undefined;
  isOpen: boolean;
  onCloseSidebar: () => void;
  onNewChat: () => void;
  onOpenSearch: () => void;
}) {
  return (
    <div className="lg:-ml-3.5 lg:overflow-hidden">
      <m.div
        animate={isOpen ? 'open' : 'closed'}
        initial={false}
        variants={{
          open: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
          closed: { transition: { duration: 0.15 } },
        }}
        className={cn(
          'flex w-full flex-col lg:w-[259px]',
          className,
          !isOpen && 'lg:pointer-events-none',
        )}
      >
        <m.div
          variants={sidebarItemVariants}
          className="mb-4 flex items-center justify-between pl-3.5"
        >
          <H3>Concierge</H3>
          <div className="hidden lg:block">
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-md p-1 text-zinc-400 hover:text-zinc-700"
                    onClick={onCloseSidebar}
                  >
                    <IconSidebarSimpleLeftSquare
                      size={16}
                      className="[&_path]:stroke-2"
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Hide Sidebar</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </m.div>

        <m.div variants={sidebarItemVariants} className="flex flex-col">
          <Button
            variant="ghost"
            size="medium"
            className="justify-start gap-2 px-3 py-2 text-secondary"
            onClick={onNewChat}
          >
            <IconEditSmall1 size={16} className="[&_path]:stroke-2" />
            New Chat
          </Button>
          <CareTeamDialog
            trigger={
              <Button
                variant="ghost"
                size="medium"
                className="w-full justify-start gap-2 px-3 py-2 text-secondary"
              >
                <img
                  className="size-4 rounded-full object-cover"
                  src="/services/doctors/doc_1.webp"
                  alt="Superpower Concierge Doctor 1"
                />
                Text Care Team
              </Button>
            }
          />
          <Button
            variant="ghost"
            size="medium"
            className="justify-start gap-2 px-3 py-2 text-secondary"
            onClick={onOpenSearch}
          >
            <IconMagnifyingGlass size={16} className="[&_path]:stroke-2" />
            Search
          </Button>
        </m.div>

        <m.div variants={sidebarItemVariants} className="relative">
          <div className="pointer-events-none absolute top-0 z-10 h-6 w-full bg-gradient-to-t from-transparent to-zinc-50" />
          <div className="pointer-events-none absolute bottom-0 z-10 h-6 w-full bg-gradient-to-b from-transparent to-zinc-50" />
          <div className="scrollbar-w-1.5 flex max-h-[calc(100vh-16rem)] flex-col gap-4 overflow-y-scroll px-px py-6 scrollbar scrollbar-track-transparent scrollbar-thumb-zinc-300 hover:scrollbar-thumb-zinc-400">
            {groupedChats.today.length > 0 && (
              <ChatHistoryGroup
                title="Today"
                chats={groupedChats.today}
                activeChatId={activeChatId}
              />
            )}
            {groupedChats.yesterday.length > 0 && (
              <ChatHistoryGroup
                title="Yesterday"
                chats={groupedChats.yesterday}
                activeChatId={activeChatId}
              />
            )}
            {groupedChats.lastWeek.length > 0 && (
              <ChatHistoryGroup
                title="Last 7 days"
                chats={groupedChats.lastWeek}
                activeChatId={activeChatId}
              />
            )}
            {groupedChats.lastMonth.length > 0 && (
              <ChatHistoryGroup
                title="Last 30 days"
                chats={groupedChats.lastMonth}
                activeChatId={activeChatId}
              />
            )}
            {groupedChats.older.length > 0 && (
              <ChatHistoryGroup
                title="Older"
                chats={groupedChats.older}
                activeChatId={activeChatId}
              />
            )}
          </div>
        </m.div>
      </m.div>
    </div>
  );
}

function ChatHistoryGroup({
  title,
  chats,
  activeChatId,
}: {
  title: string;
  chats: Chat[];
  activeChatId: string | undefined;
}) {
  const items: JSX.Element[] = [];
  for (const chat of chats) {
    items.push(
      <ChatItem
        key={chat.id}
        chat={chat}
        isActive={chat.id === activeChatId}
      />,
    );
  }

  return (
    <div className="space-y-0.5">
      <Body3 className="px-3 pb-1 text-tertiary">{title}</Body3>
      {items}
    </div>
  );
}

interface LoadingChatSkeletonRow {
  key: string;
  widthPercent: number;
}

const LOADING_CHAT_SKELETON_ROWS: LoadingChatSkeletonRow[] = [
  { key: 'w-44-a', widthPercent: 44 },
  { key: 'w-100', widthPercent: 100 },
  { key: 'w-28', widthPercent: 28 },
  { key: 'w-64', widthPercent: 64 },
  { key: 'w-52', widthPercent: 52 },
  { key: 'w-22', widthPercent: 22 },
  { key: 'w-78', widthPercent: 78 },
  { key: 'w-44-b', widthPercent: 44 },
  { key: 'w-54', widthPercent: 54 },
  { key: 'w-86', widthPercent: 86 },
];

const LoadingChatItem = () => {
  return (
    <div>
      <Body3 className="px-2 pb-1 text-zinc-700">Today</Body3>
      <div className="flex w-[258px] flex-col">
        {LOADING_CHAT_SKELETON_ROWS.map((row) => (
          <div
            key={row.key}
            className="flex h-8 items-center gap-2 rounded-md px-2"
          >
            <div
              className="h-4 max-w-[--skeleton-width] flex-1 rounded-md bg-muted"
              style={
                {
                  '--skeleton-width': `${row.widthPercent}%`,
                } as React.CSSProperties
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export const ChatHistory = () => {
  const { width } = useWindowDimensions();

  if (width <= 1024) {
    return (
      <Sheet>
        <div className="flex w-full items-center gap-4 pt-4">
          <div className="flex items-center gap-4">
            <SheetTrigger>
              <IconSidebarSimpleLeftSquare
                size={20}
                className="text-zinc-400 [&_path]:stroke-2"
              />
            </SheetTrigger>
            <H3 className="mt-0.5">Concierge</H3>
          </div>
        </div>
        <SheetContent
          side="left"
          className="overflow-y-scroll bg-zinc-50 px-4 pt-12"
        >
          <SheetTitle className="sr-only">Concierge</SheetTitle>
          <SheetDescription className="sr-only">
            Browse, search, and manage your conversation history.
          </SheetDescription>
          <ChatHistoryContainer />
        </SheetContent>
      </Sheet>
    );
  }

  return <ChatHistoryContainer />;
};
