import { Outlet } from '@tanstack/react-router';

import { ConciergeChatPanel } from '@/features/messages/components/ai/concierge-chat-panel';
import { ChatHistory } from '@/features/messages/components/ai/history';

export const ConciergeLayout = () => {
  return (
    <div className="mx-auto flex min-h-[calc(100dvh-72px)] w-full max-w-[1600px] flex-col gap-4 px-4 lg:h-[calc(100dvh-68px)] lg:flex-row lg:px-16 lg:pt-10">
      <ChatHistory />
      <div className="flex min-w-0 flex-1 flex-col">
        <ConciergeChatPanel />
        <Outlet />
      </div>
    </div>
  );
};
