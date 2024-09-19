import { X } from 'lucide-react';
import * as React from 'react';

import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import {
  SheetContent,
  SheetTrigger,
  Sheet,
  SheetClose,
} from '@/components/ui/sheet';
import { Body2 } from '@/components/ui/typography';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';

import { BiomarkerCard } from '../biomarker-card/biomarker-card';

export function BiomarkerTableDialogRow({
  children,
  biomarker,
}: any): JSX.Element {
  const { width } = useWindowDimensions();
  if (width <= 768) {
    return (
      <Sheet>
        <SheetTrigger asChild>{children}</SheetTrigger>
        <SheetContent className="flex max-h-full flex-col rounded-t-[10px]">
          <div className="flex items-center justify-between px-4 pt-16 md:pb-4">
            <SheetClose>
              <div className="flex h-[44px] min-w-[44px] items-center justify-center rounded-full bg-[#F7F7F7]">
                <X className="h-4 min-w-4" />
              </div>
            </SheetClose>
            <Body2>Biomarker</Body2>
            <div className="min-w-[44px]" />
          </div>
          <div className="overflow-y-auto">
            <BiomarkerCard biomarker={biomarker} />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <BiomarkerCard biomarker={biomarker} />
      </DialogContent>
    </Dialog>
  );
}
