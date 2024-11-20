import React, { useState } from 'react';

import { ContentLayout } from '@/components/layouts';
import { Button } from '@/components/ui/button';
import { Body1, H1, H3 } from '@/components/ui/typography';
import { ForYouList } from '@/features/home/components/for-you-list';
import { LatestList } from '@/features/home/components/latest-list';
import { TimelineList } from '@/features/home/components/timeline-list';
import { useUser } from '@/lib/auth';
import { cn } from '@/lib/utils';

export const HomeRoute = () => {
  const { data: user } = useUser();
  const [tab, setTab] = useState<'Latest' | 'For you'>('Latest');

  return (
    <ContentLayout title="Home">
      <div>
        <Body1>{user?.firstName}’s</Body1>
        <H1>Roadmap</H1>
      </div>
      <div className="flex w-full flex-col-reverse gap-10 xl:flex-row">
        <TimelineList />
        <div className="w-full space-y-5 xl:max-w-[332px]">
          <div className="flex gap-4">
            <Button variant="ghost" className="p-0">
              <H3
                className={cn(tab === 'Latest' ? null : 'opacity-20')}
                onClick={() => setTab('Latest')}
              >
                Latest
              </H3>
            </Button>
            <Button
              variant="ghost"
              className="p-0"
              onClick={() => setTab('For you')}
            >
              <H3 className={cn(tab === 'For you' ? null : 'opacity-20')}>
                For you
              </H3>
            </Button>
          </div>
          {tab === 'Latest' ? <LatestList /> : null}
          {tab === 'For you' ? <ForYouList /> : null}
        </div>
      </div>
    </ContentLayout>
  );
};
