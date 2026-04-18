import { Description } from '@radix-ui/react-dialog';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

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
import { getOrganAgeBiomarkers } from '@/features/data/utils/organ-age';
import { AgeShareCard } from '@/features/shareables/components/cards/age-share-card';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';
import { cn } from '@/lib/utils';

import { useDataBiomarkers } from '../../api';
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
  const navigate = useNavigate();
  const modal = useSearch({
    strict: false,
    select: (s) => s.modal,
  });
  const [showAge, setShowAge] = useState(false);
  const { width } = useWindowDimensions();
  const { data: dataBiomarkersData } = useDataBiomarkers();
  const biologicalAgeMarker = dataBiomarkersData?.biomarkers.find(
    (b) => b.slug === 'biological-age',
  )?.observation;

  const [selectedTab, setSelectedTab] =
    useState<(typeof tabs)[number]['value']>('chart');

  const organAgeBiomarkers = getOrganAgeBiomarkers(
    dataBiomarkersData?.biomarkers,
  );

  useEffect(() => {
    const shouldBeOpen = modal === 'biological-age' && !disabled;
    const timeoutId = setTimeout(() => {
      setOpen(shouldBeOpen);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [modal, disabled]);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    void navigate({
      // useNavigate without `from` types search as `never` since the route is unknown.
      // We omit `from` so this dialog works on any route (e.g. /data, /protocol/reveal).
      search: ((prev: Record<string, unknown>) => ({
        ...prev,
        modal: nextOpen ? 'biological-age' : undefined,
      })) as never,
    });
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
              <span className="sr-only">Close</span>
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
          <AgeShareCard
            showAge={showAge}
            setShowAge={setShowAge}
            showPrivacyToggle={false}
          />
        </SimpleTabsContent>
      </SimpleTabs>
      {organAgeBiomarkers.length > 0 && (
        <div className="mb-8 space-y-4">
          <H3>Your OrganAge Report</H3>
          {organAgeBiomarkers.map((bm) => (
            <BiomarkersAccordion key={bm.id} biomarker={bm} />
          ))}
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
          <SheetContent className="flex h-[calc(100vh-8rem)] flex-col rounded-t-3xl p-4 pt-7 md:p-8">
            {content}
          </SheetContent>
        </Sheet>
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
            'max-h-[70vh] md:min-h-[750px]',
          )}
        >
          {content}
        </DialogContent>
      </Dialog>
    </>
  );
};
