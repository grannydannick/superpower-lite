import { Widget } from '@typeform/embed-react';
import { X } from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Body3 } from '@/components/ui/typography';
import { env } from '@/config/env';
import { useUpdateQuestionnaire } from '@/features/users/api/update-questionnaire';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';
import { useUser } from '@/lib/auth';

export const TypeformDialog = ({
  questionnaireId,
}: {
  questionnaireId: string;
}) => {
  const { data: user } = useUser();
  const { width } = useWindowDimensions();
  const [open, setOpen] = useState(false);
  const { mutate } = useUpdateQuestionnaire();

  const typeformFormId = env.TYPEFORM_FORM_ID;

  const content = (
    <>
      <div className="flex w-full items-center justify-between p-6">
        <Button
          variant="glass"
          className="size-12 rounded-full p-0"
          onClick={() => setOpen(false)}
        >
          <X className="size-4" />
        </Button>

        <div className="w-[114px]">
          <img className="w-auto" src="/logo.svg" alt="logo" />
        </div>
        <div className="size-12" />
      </div>
      <Widget
        id={typeformFormId}
        className="h-[80dvh] w-full"
        opacity={0}
        transitiveSearchParams={['email']}
        hidden={{
          email: user?.email ?? '',
          user_id: user?.id ?? '',
        }}
        onSubmit={() => {
          mutate({
            data: { status: 'ACTIVE' },
            questionnaireId: questionnaireId,
          });
          setOpen(false);
        }}
      />
      <div className="flex w-full justify-center bg-primary/20 p-4">
        <Body3 className="text-center text-white">
          Your answers will only be viewed by your medical team and will not be
          shared with any partners without your explicit consent.
        </Body3>
      </div>
    </>
  );

  if (width <= 768) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className="bg-white" size="medium">
            Complete
          </Button>
        </SheetTrigger>
        <SheetContent className="flex max-h-full flex-col bg-female-face bg-cover bg-no-repeat">
          {content}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-white" size="medium">
          Complete
        </Button>
      </DialogTrigger>
      <DialogContent className="h-dvh max-h-none max-w-none rounded-none bg-female-face bg-cover bg-no-repeat">
        {content}
      </DialogContent>
    </Dialog>
  );
};
