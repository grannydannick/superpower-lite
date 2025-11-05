import { Description } from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { useState } from 'react';

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
import { SimpleTabs, SimpleTabsContent } from '@/components/ui/simple-tabs';
import { Body1, H3 } from '@/components/ui/typography';
import { BiomarkerContentTabs } from '@/features/data/components/dialogs/biomarker-content-tabs';
import { ScoreShareCard } from '@/features/shareables/components/cards/score-share-card';
import { SharingOptionsModal } from '@/features/shareables/components/sharing-options-modal';
import { cn } from '@/lib/utils';

import { useBiomarkers } from '../../api';
import { mostRecent } from '../../utils/most-recent-biomarker';
import { BiomarkersDataTable } from '../table/biomarkers-data-table';

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

export const SuperpowerScoreDialog = ({
  children,
  disabled = false,
}: {
  children: React.ReactNode;
  disabled?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const [sharingOptionsOpen, setSharingOptionsOpen] = useState(false);
  const { data: biomarkersData } = useBiomarkers();
  const superpowerScoreMarker = biomarkersData?.biomarkers.find(
    (b) => b.name == 'Health Score',
  );

  const [selectedTab, setSelectedTab] =
    useState<(typeof tabs)[number]['value']>('chart');

  const latestScore = mostRecent(superpowerScoreMarker?.value ?? []);

  // get biomarker IDs from categories (ignore labels for now)
  const relatedBiomarkerIds = new Set(
    latestScore?.component
      .flatMap((c) => c.relatedObservations ?? [])
      .filter(Boolean),
  );

  // if we have category biomarker IDs, filter by those
  const categoryBiomarkers =
    biomarkersData?.biomarkers.filter((b) =>
      b.value?.some((v) => v.id && relatedBiomarkerIds.has(v.id)),
    ) ?? [];

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger
          asChild
          disabled={disabled}
          className={cn(disabled && 'pointer-events-none')}
        >
          {children}
        </DialogTrigger>
        <DialogContent
          className={cn(
            'flex flex-col overflow-x-hidden',
            dialogVariants({ size: '2xlarge' }),
            'md:min-h-[750px] max-h-[70vh]',
            sharingOptionsOpen && '-mt-10 scale-[.92] opacity-75',
          )}
        >
          <div className="-mt-3 flex items-center justify-between">
            <DialogTitle>
              <Body1 className="line-clamp-2 text-zinc-400">
                Superpower Score
              </Body1>
            </DialogTitle>
            <div className="-mr-3 flex items-center gap-2">
              {/* <Button
                variant="outline"
                className="h-10 px-3"
                onClick={() => setSharingOptionsOpen(true)}
              >
                Share
                <Upload strokeWidth={2} className="ml-2 size-4 text-zinc-400" />
              </Button> */}
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
              <TimeSeriesChart biomarker={superpowerScoreMarker!} />
            </SimpleTabsContent>
            <SimpleTabsContent className="w-full" value="card">
              <ScoreShareCard />
            </SimpleTabsContent>
          </SimpleTabs>

          {superpowerScoreMarker && (
            <BiomarkerContentTabs biomarker={superpowerScoreMarker} />
          )}

          {categoryBiomarkers.length > 0 && (
            <div className="mt-4">
              <H3 className="mb-2">
                Which biomarkers influence your Health Score?
              </H3>
              <BiomarkersDataTable
                biomarkers={categoryBiomarkers ?? []}
                hideHeader
                hiddenColumns={['value', 'optimalRange']}
              />
            </div>
          )}

          <Description hidden>
            Information about the superpower score.
          </Description>
        </DialogContent>
      </Dialog>
      <SharingOptionsModal
        open={sharingOptionsOpen}
        onOpenChange={setSharingOptionsOpen}
        cardType="score"
      />
    </>
  );
};
