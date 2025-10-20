import { Description } from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { dialogVariants } from '@/components/ui/dialog/utils/dialog-variants';
import { SimpleTabs, SimpleTabsContent } from '@/components/ui/simple-tabs';
import { Body1 } from '@/components/ui/typography';
import { useAnalytics } from '@/hooks/use-analytics';
import { cn } from '@/lib/utils';

import { AgeShareCard } from './cards/age-share-card';
import { ScoreShareCard } from './cards/score-share-card';

const tabs = [
  {
    label: 'Superpower Score',
    value: 'score',
  },
  {
    label: 'Biological Age',
    value: 'age',
  },
];

export const ShareableCardsModal = ({
  children,
  preselectedTab = 'score',
  disabled = false,
}: {
  children: React.ReactNode;
  preselectedTab?: (typeof tabs)[number]['value'];
  disabled?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const { track } = useAnalytics();
  // const [sharingOptionsOpen, setSharingOptionsOpen] = useState(false);

  // State needed for showing appropriate share card
  const [showAge, setShowAge] = useState(true);

  const [selectedTab, setSelectedTab] = useState(preselectedTab);
  const navigate = useNavigate();

  // const shareCard =
  //   selectedTab === 'age' ? (showAge ? 'age' : 'age-hidden') : 'score';

  // Update the selected tab based on preselectedTab when the modal is opened
  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      setOpen(newOpen);
      if (newOpen) {
        setSelectedTab(preselectedTab);
        track('viewed_shareable_card', {
          card_type: preselectedTab,
        });
      }
    },
    [preselectedTab, track],
  );

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger
          asChild
          disabled={disabled}
          className={cn(disabled && 'pointer-events-none')}
        >
          {children}
        </DialogTrigger>
        <DialogContent
          className={cn(
            dialogVariants({ size: '2xlarge' }),
            'md:min-h-[750px]',
            // sharingOptionsOpen && '-mt-10 scale-[.92] opacity-75',
          )}
        >
          <DialogTitle>
            <Body1 className="text-zinc-400">
              {tabs.find((tab) => tab.value === selectedTab)?.label}
            </Body1>
          </DialogTitle>
          <DialogClose asChild>
            <Button
              variant="ghost"
              className="absolute right-5 top-5 text-zinc-400"
            >
              <X strokeWidth={2.5} className="size-4" />
            </Button>
          </DialogClose>
          <SimpleTabs
            tabs={tabs}
            defaultTab={preselectedTab}
            value={selectedTab}
            onValueChange={setSelectedTab}
            className="mb-8 flex flex-col items-center gap-8"
          >
            <SimpleTabsContent className="w-full" value="score">
              <ScoreShareCard />
            </SimpleTabsContent>
            <SimpleTabsContent className="w-full" value="age">
              <AgeShareCard showAge={showAge} setShowAge={setShowAge} />
            </SimpleTabsContent>
          </SimpleTabs>
          {/* <Button
            variant="default"
            size="medium"
            className="mx-auto w-28 gap-2 text-center"
            onClick={() => setSharingOptionsOpen(true)}
          >
            Share <Upload className="size-4" />
          </Button> */}
          <Button
            onClick={() => navigate(`/data?modal=superpower-score`)}
            variant="ghost"
            size="medium"
            className="text-center"
          >
            What is {tabs.find((tab) => tab.value === selectedTab)?.label}?
          </Button>
          <Description hidden>
            Share your superpower score or biological age with your friends and
            family.
          </Description>
        </DialogContent>
      </Dialog>
      {/* <SharingOptionsModal
        open={sharingOptionsOpen}
        onOpenChange={setSharingOptionsOpen}
        cardType={shareCard}
      /> */}
    </>
  );
};
