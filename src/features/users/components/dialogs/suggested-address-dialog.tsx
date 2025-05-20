import { X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { H3 } from '@/components/ui/typography';
import { US_STATES } from '@/const';
import { FormAddressInput } from '@/types/address';

export const SuggestedAddressDialog = ({
  suggestedAddress,
  onAccept,
  onReject,
  variant = 'dialog',
}: {
  suggestedAddress: FormAddressInput;
  onAccept: () => void;
  onReject?: () => void;
  variant?: 'dialog' | 'block';
}) => {
  const content = (
    <>
      <div className="space-y-5">
        <div className="flex flex-col gap-2">
          <Label className="text-secondary">Address Line 1</Label>
          <Input disabled value={suggestedAddress.line1} />
        </div>
        <div className="flex flex-col gap-2">
          <Label className="text-secondary">Address Line 2</Label>
          <Input disabled value={suggestedAddress.line2} />
        </div>
        <div className="grid grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-3">
          <div className="flex flex-col gap-2">
            <Label className="text-secondary">City</Label>
            <Input disabled value={suggestedAddress.city} />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-secondary">State</Label>
            <Input
              disabled
              value={
                US_STATES.find((s) => s.value === suggestedAddress.state)?.label
              }
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-secondary">Zip Code</Label>
            <Input disabled value={suggestedAddress.postalCode} />
          </div>
        </div>
      </div>
      <DialogFooter className="mt-8">
        <div className="flex w-full flex-col gap-2">
          <Button onClick={onAccept} className="w-full rounded-full py-3">
            Yes, update
          </Button>
          <Button
            onClick={onReject}
            variant="ghost"
            className="w-full rounded-full py-3 text-zinc-500 transition-colors duration-200 hover:text-zinc-600"
          >
            No, return to address details
          </Button>
        </div>
      </DialogFooter>
    </>
  );

  if (variant === 'block') return content;

  return (
    <Dialog open={!!suggestedAddress}>
      <DialogContent className="max-w-[95vw] p-8 sm:max-w-[525px]">
        <DialogTitle className="mb-6 flex items-start justify-between">
          <H3>Did you mean?</H3>
          <DialogClose asChild onClick={onReject}>
            <Button
              variant="ghost"
              size="icon"
              className="text-zinc-500 transition-colors duration-200 hover:text-zinc-600"
            >
              <X size={16} />
            </Button>
          </DialogClose>
        </DialogTitle>
        {content}
      </DialogContent>
    </Dialog>
  );
};
