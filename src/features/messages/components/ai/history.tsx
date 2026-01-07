import { isToday, isYesterday, subMonths, subWeeks } from 'date-fns';
import { MoreHorizontalIcon, PanelLeft, Search, SquarePen } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown';
import { Input } from '@/components/ui/input';
import { Link } from '@/components/ui/link';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
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
import { ChatShareDialog } from '../chat-share-dialog';

type GroupedChats = {
  today: Chat[];
  yesterday: Chat[];
  lastWeek: Chat[];
  lastMonth: Chat[];
  older: Chat[];
};

const ChatItem = ({ chat, isActive }: { chat: Chat; isActive: boolean }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const deleteChatMutation = useDeleteChat({
    mutationConfig: {
      onSuccess: () => {
        if (chat.id === id) {
          navigate('/concierge');
        }
      },
    },
  });

  return (
    <Link
      to={`/concierge/${chat.id}`}
      preventScrollReset
      className={cn(
        'group flex w-full rounded-full justify-between gap-2 transition-all duration-200 ease-out border px-4 py-2.5',
        isActive
          ? 'border-zinc-200 bg-white shadow-sm'
          : 'border-transparent hover:bg-zinc-100',
      )}
      onClick={() => {
        scrollToBottom();
      }}
    >
      <span
        className={cn(
          'line-clamp-1 text-sm transition-all duration-150 ease-in-out',
          isActive ? 'text-black' : 'text-zinc-400 group-hover:text-zinc-900',
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

        <DropdownMenuContent side="bottom" align="end">
          <DropdownMenuItem
            className="cursor-pointer text-pink-700 focus:bg-pink-50 focus:text-pink-700"
            onSelect={() => {
              deleteChatMutation.mutate({ chatId: chat.id });

              // If deleted chat was the last one, navigate to the concierge page
              if (!history || history?.length === 0) {
                navigate('/concierge');
              }
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
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: history, isLoading } = useHistory();

  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(true);

  const filteredChats = useMemo(() => {
    return history?.filter((chat) =>
      chat.title.toLowerCase().includes(search.toLowerCase()),
    );
  }, [history, search]);

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

  return (
    <>
      {(() => {
        const groupedChats = groupChatsByDate(filteredChats || []);

        return (
          <div className={cn('xl:w-full xl:max-w-[259px]')}>
            <div
              className={cn(
                'relative transition-all duration-500 ease-in-out',
                isOpen ? 'w-full lg:max-w-[259px]' : 'max-w-0 w-full',
              )}
            >
              <div
                className={cn(
                  'absolute top-1 hidden items-center gap-2 transition-all duration-500 lg:flex',
                  isOpen ? 'xl:right-0 -right-4' : '-right-14',
                )}
              >
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={!id}
                        className={cn(
                          'rounded-md p-1 text-zinc-400 transition-all hover:text-zinc-700',
                          isOpen
                            ? 'pointer-events-none hidden opacity-0'
                            : 'opacity-100',
                        )}
                        onClick={() => navigate('/concierge')}
                      >
                        <SquarePen size={15} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>New Chat</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-md p-1 text-zinc-400 hover:text-zinc-700"
                        onClick={() => setIsOpen(!isOpen)}
                      >
                        <AnimatedSidebarButton isSidebarOpen={isOpen} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {isOpen ? 'Hide Sidebar' : 'Show Sidebar'}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div
                className={cn(
                  'flex w-full flex-col overflow-hidden transition-all duration-500 ease-in-out',
                  className,
                  !isOpen
                    ? 'opacity-0 md:max-w-0'
                    : 'opacity-100 lg:max-w-[259px]',
                )}
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <H3>Concierge</H3>
                    <div className="rounded-full border border-vermillion-900 px-2 py-0.5">
                      <p className="font-mono text-xs text-vermillion-900">
                        BETA
                      </p>
                    </div>
                  </div>
                  <div className="lg:hidden">
                    <CareTeamDialog />
                  </div>
                </div>
                {/*<div className="h-10 rounded-xl bg-zinc-100 px-4 py-1.5" />*/}
                <div className="w-full">
                  <div className="relative mb-2 px-0.5">
                    <Search
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                    />
                    <Input
                      type="text"
                      placeholder="Search"
                      className="h-10 w-full rounded-xl border border-none bg-zinc-100 px-4 pl-8 text-sm outline-none"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>

                  <div className="mt-4 flex flex-col justify-start overflow-hidden">
                    <Button
                      variant="ghost"
                      size="medium"
                      className="justify-start gap-2 px-3 py-2 text-zinc-400"
                      disabled={!id}
                      onClick={() => {
                        navigate('/concierge');
                      }}
                    >
                      <SquarePen size={15} />
                      New AI chat
                    </Button>
                  </div>
                  {id && (
                    <CareTeamDialog
                      trigger={
                        <Button
                          variant="ghost"
                          size="medium"
                          className="justify-start gap-2 px-3 py-2 text-zinc-400"
                        >
                          <img
                            className="size-4 rounded-full object-cover"
                            src="/services/doctors/doc_1.webp"
                            alt="Superpower Concierge Doctor 1"
                          />
                          Care team
                        </Button>
                      }
                    />
                  )}
                </div>

                <div className="relative">
                  <div className="pointer-events-none absolute top-0 z-10 h-6 w-full bg-gradient-to-t from-transparent to-zinc-50" />
                  <div className="pointer-events-none absolute bottom-0 z-10 h-6 w-full bg-gradient-to-b from-transparent to-zinc-50" />
                  <div className="scrollbar-w-1.5 flex max-h-[calc(100vh-16rem)] flex-col gap-4 overflow-y-scroll px-px py-6 scrollbar scrollbar-track-transparent scrollbar-thumb-zinc-300 hover:scrollbar-thumb-zinc-400">
                    {groupedChats.today.length > 0 && (
                      <div className="space-y-0.5">
                        <Body3 className="px-3 pb-1 text-zinc-700">Today</Body3>
                        {groupedChats.today.map((chat) => (
                          <ChatItem
                            key={chat.id}
                            chat={chat}
                            isActive={chat.id === id}
                          />
                        ))}
                      </div>
                    )}

                    {groupedChats.yesterday.length > 0 && (
                      <div className="space-y-0.5">
                        <Body3 className="px-3 pb-1 text-zinc-700">
                          Yesterday
                        </Body3>
                        {groupedChats.yesterday.map((chat) => (
                          <ChatItem
                            key={chat.id}
                            chat={chat}
                            isActive={chat.id === id}
                          />
                        ))}
                      </div>
                    )}

                    {groupedChats.lastWeek.length > 0 && (
                      <div className="space-y-0.5">
                        <Body3 className="px-3 pb-1 text-zinc-700">
                          Last 7 days
                        </Body3>
                        {groupedChats.lastWeek.map((chat) => (
                          <ChatItem
                            key={chat.id}
                            chat={chat}
                            isActive={chat.id === id}
                          />
                        ))}
                      </div>
                    )}

                    {groupedChats.lastMonth.length > 0 && (
                      <div className="space-y-0.5">
                        <Body3 className="px-3 pb-1 text-zinc-700">
                          Last 30 days
                        </Body3>
                        {groupedChats.lastMonth.map((chat) => (
                          <ChatItem
                            key={chat.id}
                            chat={chat}
                            isActive={chat.id === id}
                          />
                        ))}
                      </div>
                    )}

                    {groupedChats.older.length > 0 && (
                      <div className="space-y-0.5">
                        <Body3 className="px-3 pb-1 text-zinc-700">Older</Body3>
                        {groupedChats.older.map((chat) => (
                          <ChatItem
                            key={chat.id}
                            chat={chat}
                            isActive={chat.id === id}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
}

const AnimatedSidebarButton = ({
  isSidebarOpen,
}: {
  isSidebarOpen: boolean;
}) => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12.6667 2H3.33333C2.59695 2 2 2.59695 2 3.33333V12.6667C2 13.403 2.59695 14 3.33333 14H12.6667C13.403 14 14 13.403 14 12.6667V3.33333C14 2.59695 13.403 2 12.6667 2Z"
        stroke="currentColor"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 2V8V14"
        stroke="currentColor"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(
          'transition-transform delay-200 duration-500 ease-in-out',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-1 opacity-0',
        )}
      />
    </svg>
  );
};

const LoadingChatItem = () => {
  return (
    <div>
      <Body3 className="px-2 pb-1 text-zinc-700">Today</Body3>
      <div className="flex w-[258px] flex-col">
        {[44, 100, 28, 64, 52, 22, 78, 44, 54, 86].map((item, idx) => (
          <div
            key={`${item}-${idx}`}
            className="flex h-8 items-center gap-2 rounded-md px-2"
          >
            <div
              className="h-4 max-w-[--skeleton-width] flex-1 rounded-md bg-muted"
              style={
                {
                  '--skeleton-width': `${item}%`,
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
  const { id } = useParams();
  const { width } = useWindowDimensions();

  if (width <= 1024) {
    return (
      <Sheet>
        <div className="flex w-full items-center justify-between gap-4 pt-4">
          <div className="flex items-center gap-4">
            <SheetTrigger>
              <PanelLeft size={24} className="text-zinc-400" />
            </SheetTrigger>
            <div className="flex items-center gap-2">
              <H3>Concierge</H3>
              <div className="rounded-full border border-vermillion-900 px-2 py-0.5">
                <p className="font-mono text-xs text-vermillion-900">BETA</p>
              </div>
            </div>
          </div>
          <div className="flex w-full justify-end">
            {id ? <ChatShareDialog chatId={id} /> : <CareTeamDialog />}
          </div>
        </div>
        <SheetContent
          side="left"
          className="overflow-y-scroll bg-zinc-50 px-4 pt-12"
        >
          <ChatHistoryContainer />
        </SheetContent>
      </Sheet>
    );
  }

  return <ChatHistoryContainer />;
};
