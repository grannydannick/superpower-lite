import { Outlet } from 'react-router-dom';

import { ChatHistory } from '@/features/messages/components/ai/history';

export const ConciergeLayout = () => {
  return (
    <div className="mx-auto flex min-h-[calc(100dvh-72px)] w-full max-w-6xl flex-col gap-4 px-4 lg:h-[calc(100dvh-68px)] lg:flex-row lg:pt-8 xl:px-0">
      <ChatHistory />
      <Outlet />
    </div>
  );
};
