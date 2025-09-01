import { X } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { H3 } from '@/components/ui/typography';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';
import { useUser } from '@/lib/auth';

import { PhlebotomyRecommendations } from './phlebotomy-recommendations';

export const RecommendationDialog = () => {
  const [isOpen, setIsOpen] = useState(true);
  const { width } = useWindowDimensions();
  const { isLoading } = useUser();

  if (width <= 768) {
    return (
      <Sheet open={isOpen && !isLoading} onOpenChange={setIsOpen}>
        <SheetContent className="flex flex-col overflow-hidden rounded-t-2xl">
          <SheetHeader className="pb-0">
            <SheetTitle className="ml-4">
              <H3>Recommendations for testing</H3>
            </SheetTitle>
            <SheetClose asChild className="-mt-4">
              <div className="flex h-[44px] min-w-[44px] cursor-pointer items-center justify-center rounded-full">
                <X className="h-4 min-w-4" />
              </div>
            </SheetClose>
          </SheetHeader>
          <div className="flex h-full flex-col justify-between space-y-8 px-8 pb-12">
            <div className="space-y-4">
              <PhlebotomyRecommendations />
            </div>
            <div className="mt-12 flex justify-end">
              <SheetClose asChild>
                <Button variant="default" className="w-full text-sm">
                  Continue
                </Button>
              </SheetClose>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={isOpen && !isLoading} onOpenChange={setIsOpen}>
      <DialogContent className="gap-2">
        <DialogHeader className="-mt-4 px-8 pb-0">
          <DialogTitle>
            <H3>Recommendations for testing</H3>
          </DialogTitle>
          <DialogClose>
            <X className="hidden size-4 cursor-pointer md:block" />
          </DialogClose>
        </DialogHeader>
        <div className="px-8">
          <PhlebotomyRecommendations />
        </div>
        <DialogFooter className="p-8">
          <Button onClick={() => setIsOpen(false)}>Continue</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
