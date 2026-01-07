import { Description } from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { TimeSeriesChart } from '@/components/ui/charts/time-series-chart/time-series-chart';
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
import {
  getOrganAgeBiomarkers,
  resolveRelatedBiomarkers,
} from '@/features/data/utils/organ-age';
import { AgeShareCard } from '@/features/shareables/components/cards/age-share-card';
import { SharingOptionsModal } from '@/features/shareables/components/sharing-options-modal';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';
import { cn } from '@/lib/utils';

import { useBiomarkers } from '../../api';
import { BiomarkersAccordion } from '../biomarkers-accordion';

import { BiomarkerContentTabs } from './biomarker-content-tabs';

const tabs = [
  {
    label: 'Trend View',
    value: 'chart',
  },
  {
    label: 'Score Card',
    value: 'card',
  },
];

export const BiologicalAgeDialog = ({
  children,
  disabled = false,
}: {
  children: React.ReactNode;
  disabled?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [sharingOptionsOpen, setSharingOptionsOpen] = useState(false);
  const [showAge, setShowAge] = useState(false);
  const { width } = useWindowDimensions();
  const { data: biomarkersData } = useBiomarkers();
  const biologicalAgeMarker = biomarkersData?.biomarkers.find(
    (b) => b.name == 'Biological Age',
  );

  const [selectedTab, setSelectedTab] =
    useState<(typeof tabs)[number]['value']>('chart');

  const organAgeBiomarkers = getOrganAgeBiomarkers(biomarkersData?.biomarkers);

  useEffect(() => {
    const modal = (searchParams.get('modal') || '').toLowerCase();
    const shouldBeOpen = modal === 'biological-age' && !disabled;
    setOpen(shouldBeOpen);
  }, [searchParams, disabled]);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    const params = new URLSearchParams(searchParams);
    if (nextOpen) {
      params.set('modal', 'biological-age');
    } else if (params.get('modal') === 'biological-age') {
      params.delete('modal');
    }
    setSearchParams(params);
  };

  const content = (
    <>
      <div className="-mt-3 flex items-center justify-between">
        <DialogTitle>
          <Body1 className="line-clamp-2 text-zinc-400">Biological Age</Body1>
        </DialogTitle>
        <div className="-mr-3 flex items-center gap-2">
          <DialogClose asChild>
            <Button variant="ghost" className="text-zinc-400">
              <X strokeWidth={2.5} className="size-4" />
            </Button>
          </DialogClose>
        </div>
      </div>
      <SimpleTabs
        tabs={tabs}
        defaultTab={selectedTab}
        value={selectedTab}
        onValueChange={setSelectedTab}
        className="mb-8 flex flex-1 flex-col items-center justify-between gap-8"
      >
        <SimpleTabsContent
          className="flex w-full flex-1 flex-col justify-center"
          value="chart"
        >
          <TimeSeriesChart biomarker={biologicalAgeMarker!} />
        </SimpleTabsContent>
        <SimpleTabsContent className="w-full" value="card">
          <AgeShareCard showAge={showAge} setShowAge={setShowAge} />
        </SimpleTabsContent>
      </SimpleTabs>
      {organAgeBiomarkers.length > 0 && (
        <div className="mb-8 space-y-4">
          <H3>Your OrganAge Report</H3>
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
      )}
      {biologicalAgeMarker && (
        <BiomarkerContentTabs biomarker={biologicalAgeMarker} />
      )}
      <Description hidden>Information about the biological age.</Description>
    </>
  );

  if (width <= 1024) {
    return (
      <>
        <Sheet open={open} onOpenChange={handleOpenChange}>
          <SheetTrigger
            asChild
            disabled={disabled}
            className={cn(disabled && 'pointer-events-none')}
          >
            {children}
          </SheetTrigger>
          <SheetContent
            className={cn(
              'flex h-[calc(100vh-8rem)] flex-col rounded-t-3xl p-4 pt-7 md:p-8',
              sharingOptionsOpen && '-mt-10 scale-[.92] opacity-75',
            )}
          >
            {content}
          </SheetContent>
        </Sheet>
        <SharingOptionsModal
          open={sharingOptionsOpen}
          onOpenChange={setSharingOptionsOpen}
          cardType={showAge ? 'age' : 'age-hidden'}
        />
      </>
    );
  }

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
            'flex flex-col',
            dialogVariants({ size: '2xlarge' }),
            'md:min-h-[750px] max-h-[70vh]',
            sharingOptionsOpen && '-mt-10 scale-[.92] opacity-75',
          )}
        >
          {content}
        </DialogContent>
      </Dialog>
      <SharingOptionsModal
        open={sharingOptionsOpen}
        onOpenChange={setSharingOptionsOpen}
        cardType={showAge ? 'age' : 'age-hidden'}
      />
    </>
  );
};
