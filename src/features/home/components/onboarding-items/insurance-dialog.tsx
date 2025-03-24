import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Body1, Body2 } from '@/components/ui/typography';
import { CreatePolicyForm } from '@/features/insurance/components/create-policy-form';
import { useUpdateTask } from '@/features/tasks/api/update-task';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';
import { cn } from '@/lib/utils';

export const InsuranceDialog = () => {
  const { width } = useWindowDimensions();
  const { mutate } = useUpdateTask();
  const [current, setCurrent] = useState<'collection' | 'submitted'>(
    'collection',
  );

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      if (current === 'submitted') {
        mutate({
          data: { status: 'completed' },
          taskName: 'onboarding-insurance',
        });
      }
    }
  };

  if (width <= 768) {
    return (
      <Sheet onOpenChange={handleOpenChange}>
        <SheetTrigger asChild>
          <Button size="medium" variant="outline" className="bg-white">
            Complete
          </Button>
        </SheetTrigger>
        <SheetContent className="flex max-h-full flex-col rounded-t-[10px]">
          <SheetHeader>
            <SheetClose>
              <div className="flex h-[44px] min-w-[44px] items-center justify-center rounded-full bg-zinc-100">
                <X className="h-4 min-w-4" />
              </div>
            </SheetClose>
            <SheetTitle>Book a service</SheetTitle>
            <div className="min-w-[44px]" />
          </SheetHeader>
          <div className="overflow-auto px-6">
            {current === 'collection' ? (
              <CreatePolicyForm
                onSuccess={() => {
                  setCurrent('submitted');
                }}
              />
            ) : null}
            {current === 'submitted' ? <InsuranceSubmitted /> : null}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="medium" variant="outline" className="bg-white">
          Complete
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[420px]">
        <DialogHeader className="px-6 pb-0">
          <DialogTitle>Insurance</DialogTitle>
          <DialogClose>
            <X className="size-6 cursor-pointer p-1" />
          </DialogClose>
        </DialogHeader>
        <div className="px-6">
          {current === 'collection' ? (
            <CreatePolicyForm
              onSuccess={() => {
                setCurrent('submitted');
              }}
            />
          ) : null}
          {current === 'submitted' ? <InsuranceSubmitted /> : null}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const InsuranceSubmitted = () => {
  return (
    <>
      <div className="min-h-[350px]">
        <div className="mx-auto flex max-w-[70%] flex-col items-center justify-center gap-4">
          <ShieldCheckIcon className="size-24" />
          <Body1 className="text-zinc-500">Thank you!</Body1>
          <Body2 className="text-center text-zinc-500">
            Our team will notify you if your plan is covered when Superpower
            begins accepting insurance for provider consults.
          </Body2>
        </div>
      </div>
      <DialogClose asChild>
        <Button className="mb-12 w-full">Close</Button>
      </DialogClose>
    </>
  );
};

// const InsuranceAccepted = () => {
//   return (
//     <>
//       <div className="min-h-[420px] space-y-8">
//         <InsuranceAcceptedCard />
//         <div className="mx-auto flex max-w-[70%] flex-col items-center justify-center gap-4">
//           <ShieldCheckIcon className="size-24" />
//           <Body1 className="text-zinc-500">Good news!</Body1>
//           <Body2 className="text-center text-zinc-500">
//             Superpower is able to accept your insurance!
//           </Body2>
//         </div>
//       </div>
//       <DialogClose asChild>
//         <Button className="mb-12 w-full">Close</Button>
//       </DialogClose>
//     </>
//   );
// };
//
// const InsuranceRejected = () => {
//   return (
//     <>
//       <div className="min-h-[350px]">
//         <div className="mx-auto flex max-w-[70%] flex-col items-center justify-center gap-4">
//           <BanIcon className="size-24" />
//           <Body1 className="text-zinc-500">Sorry</Body1>
//           <Body2 className="text-center text-zinc-500">
//             Superpower does not have Providers that accept your insurance
//           </Body2>
//         </div>
//       </div>
//       <DialogClose asChild>
//         <Button className="mb-12 w-full">Close</Button>
//       </DialogClose>
//     </>
//   );
// };
//
// const InsuranceAcceptedCard = () => {
//   return (
//     <div className="w-full space-y-2 rounded-lg border border-dashed border-zinc-300 p-4">
//       <div className="flex justify-between">
//         <Body1>Insurance Found</Body1>
//         <CircleCheckBig className="size-7 text-green-500" />
//       </div>
//       <div className="flex items-center gap-3">
//         <div className="flex size-12 items-center justify-center rounded-full border border-zinc-200">
//           A
//         </div>
//         <div>
//           <Body1>Aetna PPO Gold</Body1>
//           <Body2 className="text-zinc-500">Member ID: W123555987</Body2>
//         </div>
//       </div>
//     </div>
//   );
// };

const ShieldCheckIcon = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        'flex select-none items-center justify-center text-green-500 transition-colors duration-200 size-7',
        className,
      )}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
        <motion.path
          animate={{
            opacity: [0, 1],
            pathLength: [0, 1],
            scale: [0.5, 1],
            transition: {
              duration: 0.4,
              opacity: { duration: 0.1 },
            },
          }}
          d="m9 12 2 2 4-4"
        />
      </svg>
    </div>
  );
};

export { ShieldCheckIcon };

// const BanIcon = ({ className }: { className?: string }) => {
//   return (
//     <div
//       className={cn(
//         'flex select-none items-center justify-center text-pink-700 transition-colors duration-200 size-7',
//         className,
//       )}
//     >
//       <svg
//         xmlns="http://www.w3.org/2000/svg"
//         viewBox="0 0 24 24"
//         fill="none"
//         stroke="currentColor"
//         strokeWidth="2"
//         strokeLinecap="round"
//         strokeLinejoin="round"
//       >
//         <motion.circle
//           cx="12"
//           cy="12"
//           r="10"
//           animate={{
//             opacity: [0, 1],
//             pathLength: [0, 1],
//             transition: {
//               duration: 0.4,
//               opacity: { duration: 0.1 },
//             },
//           }}
//         />
//         <motion.path
//           d="m4.9 4.9 14.2 14.2"
//           animate={{
//             opacity: [0, 1],
//             pathLength: [0, 1],
//             transition: {
//               duration: 0.4,
//               delay: 0.5,
//               opacity: { duration: 0.1 },
//             },
//           }}
//         />
//       </svg>
//     </div>
//   );
// };
//
// export { BanIcon };
