import { IconEditSmall1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconEditSmall1';
import { IconMagnifyingGlass } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconMagnifyingGlass';
import { IconSidebarSimpleLeftSquare } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconSidebarSimpleLeftSquare';
import { isToday, isYesterday, subMonths, subWeeks } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { MoreHorizontalIcon } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown';
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
        'group flex w-full justify-between gap-2 rounded-xl px-4 py-2.5 transition-all duration-200 ease-out',
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

        <DropdownMenuContent side="bottom" align="end" className="z-[60]">
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
        const groupedChats = groupChatsByDate(history || []);

        return (
          <div
            className={cn(
              'relative lg:shrink-0 lg:transition-[max-width] lg:duration-500 lg:ease-in-out',
              isOpen ? 'lg:max-w-[259px]' : 'lg:max-w-10',
            )}
          >
            {/* Collapsed icon bar */}
            <div className="absolute left-0 top-0 hidden w-10 flex-col items-center gap-3 pt-1 lg:flex">
              <AnimatePresence>
                {!isOpen && (
                  <>
                    <motion.div
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
                              onClick={() => setIsOpen(true)}
                            >
                              <IconSidebarSimpleLeftSquare
                                size={16}
                                className="[&_path]:stroke-2"
                              />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            Show Sidebar
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </motion.div>
                    <motion.div
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
                              disabled={!id}
                              className="rounded-md p-1 text-zinc-400 hover:text-zinc-700"
                              onClick={() => navigate('/concierge')}
                            >
                              <IconEditSmall1
                                size={16}
                                className="[&_path]:stroke-2"
                              />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="right">New Chat</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </motion.div>
                    <motion.div
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
                          <TooltipContent side="right">
                            Text Care Team
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </motion.div>
                    <motion.div
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
                              onClick={() => setSearchOpen(true)}
                            >
                              <IconMagnifyingGlass
                                size={16}
                                className="[&_path]:stroke-2"
                              />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            Search (⌘K)
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Full sidebar - wrapped in overflow-hidden so tooltips on collapsed bar aren't clipped */}
            <div className="lg:-ml-3.5 lg:overflow-hidden">
              <motion.div
                animate={isOpen ? 'open' : 'closed'}
                initial={false}
                variants={{
                  open: {
                    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
                  },
                  closed: { transition: { duration: 0.15 } },
                }}
                className={cn(
                  'flex w-full flex-col lg:w-[259px]',
                  className,
                  !isOpen && 'lg:pointer-events-none',
                )}
              >
                <motion.div
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
                            onClick={() => setIsOpen(false)}
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
                </motion.div>

                <motion.div
                  variants={sidebarItemVariants}
                  className="flex flex-col"
                >
                  <Button
                    variant="ghost"
                    size="medium"
                    className="justify-start gap-2 px-3 py-2 text-secondary"
                    onClick={() => {
                      navigate('/concierge');
                    }}
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
                    onClick={() => setSearchOpen(true)}
                  >
                    <IconMagnifyingGlass
                      size={16}
                      className="[&_path]:stroke-2"
                    />
                    Search
                  </Button>
                </motion.div>

                <motion.div variants={sidebarItemVariants} className="relative">
                  <div className="pointer-events-none absolute top-0 z-10 h-6 w-full bg-gradient-to-t from-transparent to-zinc-50" />
                  <div className="pointer-events-none absolute bottom-0 z-10 h-6 w-full bg-gradient-to-b from-transparent to-zinc-50" />
                  <div className="scrollbar-w-1.5 flex max-h-[calc(100vh-16rem)] flex-col gap-4 overflow-y-scroll px-px py-6 scrollbar scrollbar-track-transparent scrollbar-thumb-zinc-300 hover:scrollbar-thumb-zinc-400">
                    {groupedChats.today.length > 0 && (
                      <div className="space-y-0.5">
                        <Body3 className="px-3 pb-1 text-tertiary">Today</Body3>
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
                        <Body3 className="px-3 pb-1 text-tertiary">
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
                        <Body3 className="px-3 pb-1 text-tertiary">
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
                        <Body3 className="px-3 pb-1 text-tertiary">
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
                        <Body3 className="px-3 pb-1 text-tertiary">Older</Body3>
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
                </motion.div>
              </motion.div>
            </div>
          </div>
        );
      })()}
      <ChatSearchCommand open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}

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
          <ChatHistoryContainer />
        </SheetContent>
      </Sheet>
    );
  }

  return <ChatHistoryContainer />;
};
