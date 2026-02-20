import { Description } from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { dialogVariants } from '@/components/ui/dialog/utils/dialog-variants';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { SimpleTabs, SimpleTabsContent } from '@/components/ui/simple-tabs';
import { Body1, H3 } from '@/components/ui/typography';
import { useBiomarkers } from '@/features/data/api';
import { BiomarkersAccordion } from '@/features/data/components/biomarkers-accordion';
import {
  getOrganAgeBiomarkers,
  resolveRelatedBiomarkers,
} from '@/features/data/utils/organ-age';
import { useAnalytics } from '@/hooks/use-analytics';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';
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
  const { width } = useWindowDimensions();
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

  const handleWhatIsClick = () => {
    const params =
      selectedTab === 'score'
        ? '/data?modal=superpower-score'
        : '/data?modal=biological-age';

    navigate(params);
  };

  const content = (
    <>
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
      {selectedTab === 'age' && <OrganAgeSection />}
      <Button
        onClick={handleWhatIsClick}
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
    </>
  );

  if (width <= 1024) {
    return (
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetTrigger
          asChild
          disabled={disabled}
          className={cn(disabled && 'pointer-events-none')}
        >
          {children}
        </SheetTrigger>
        <SheetContent className="flex h-[calc(100vh-8rem)] flex-col rounded-t-3xl p-4 pt-7 md:p-8">
          {content}
        </SheetContent>
      </Sheet>
    );
  }

  return (
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
          'h-full md:max-h-[750px]',
        )}
      >
        {content}
      </DialogContent>
    </Dialog>
  );
};

const OrganAgeSection = () => {
  const { data: biomarkersData } = useBiomarkers();
  const organAgeBiomarkers = getOrganAgeBiomarkers(biomarkersData?.biomarkers);

  if (organAgeBiomarkers.length === 0) return null;

  return (
    <div className="my-4 w-full space-y-4">
      <H3 className="text-base">Your OrganAge Report</H3>
      {organAgeBiomarkers.map((bm) => {
        const related = resolveRelatedBiomarkers(
          bm,
          biomarkersData?.biomarkers,
        );

        return (
          <BiomarkersAccordion
            key={bm.id ?? bm.name}
            biomarker={bm}
            biomarkers={related}
          />
        );
      })}
    </div>
  );
};
