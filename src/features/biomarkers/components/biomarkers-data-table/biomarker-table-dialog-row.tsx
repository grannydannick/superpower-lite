import { X } from 'lucide-react';
import * as React from 'react';
import { ReactNode } from 'react';

import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import {
  SheetContent,
  SheetTrigger,
  Sheet,
  SheetClose,
} from '@/components/ui/sheet';
import { Body2 } from '@/components/ui/typography';
import { BiomarkerDialog } from '@/features/biomarkers/components/biomarker-dialog/biomarker-dialog';
import { useAnalytics } from '@/hooks/use-analytics';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';
import { Biomarker } from '@/types/api';

export function BiomarkerTableDialogRow({
  children,
  biomarker,
}: {
  children: ReactNode;
  biomarker: Biomarker;
}): JSX.Element {
  const { width } = useWindowDimensions();
  const { track } = useAnalytics();

  const handleOpenChange = (open: boolean) => {
    if (open) {
      track('viewed_biomarker', {
        biomarker_name: biomarker.name,
        biomarker_interpretation: biomarker.status,
      });
    }
  };

  if (width <= 768) {
    return (
      <Sheet onOpenChange={handleOpenChange}>
        <SheetTrigger asChild>{children}</SheetTrigger>
        <SheetContent className="flex max-h-full flex-col rounded-t-[10px]">
          <div className="flex items-center justify-between px-4 pt-16 md:pb-4">
            <SheetClose>
              <div className="flex h-[44px] min-w-[44px] items-center justify-center rounded-full bg-zinc-50">
                <X className="h-4 min-w-4" />
              </div>
            </SheetClose>
            <Body2>{biomarker.name}</Body2>
            <div className="min-w-[44px]" />
          </div>
          <div className="overflow-y-auto">
            <BiomarkerDialog biomarker={biomarker} />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <BiomarkerDialog biomarker={biomarker} />
      </DialogContent>
    </Dialog>
  );
}
