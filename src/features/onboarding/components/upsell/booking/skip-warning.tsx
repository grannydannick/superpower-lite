import { X } from 'lucide-react';

import { buttonVariants } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/dialog';
import { Body1, H3 } from '@/components/ui/typography';
import { useUpdateTask } from '@/features/tasks/api/update-task';
import { useStepper } from '@/lib/stepper';
import { cn } from '@/lib/utils';

export const SkipWarning = ({ children }: { children: React.ReactNode }) => {
  const { nextStep, activeStep } = useStepper((s) => s);
  const { mutateAsync: updateTaskProgress, isError } = useUpdateTask();

  const updateStep = async () => {
    await updateTaskProgress({
      taskName: 'onboarding',
      data: { progress: activeStep + 1 },
    });

    if (!isError) {
      nextStep();
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild className="w-full">
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-[90vw] p-6 md:max-w-xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex w-full justify-end">
            <AlertDialogCancel className="absolute right-8 top-8 flex aspect-square size-10 -translate-y-1.5 translate-x-1.5 items-center justify-center border-none text-zinc-500 shadow-none hover:bg-transparent">
              <X className="w-4 shrink-0" />
            </AlertDialogCancel>
          </AlertDialogTitle>
          <img
            className="w-full object-contain"
            src="/onboarding/upsell/skip-upsell.webp"
            alt="tests"
          />
          <H3 className="text-center">Continue without scheduling?</H3>
          <AlertDialogDescription className="mb-4">
            <Body1 className="mb-6 text-balance text-center text-zinc-500">
              It is advised to schedule your services now. But you can always
              book them later by visiting the “Services” page and selecting the
              &quot;To Be Scheduled&quot; tab. We won&apos;t charge you again,
              and you&apos;ll be able to choose a time that works best for you.
            </Body1>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex !flex-col gap-2">
          <AlertDialogCancel
            className={cn(
              'hover:text-white w-full !rounded-full h-14',
              buttonVariants({ size: 'default' }),
            )}
          >
            Book services now
          </AlertDialogCancel>
          <AlertDialogAction
            className={cn(
              'w-full !rounded-full text-zinc-500 !ml-0 border-none !shadow-none',
              buttonVariants({ size: 'default', variant: 'outline' }),
            )}
            onClick={updateStep}
          >
            Schedule later
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
