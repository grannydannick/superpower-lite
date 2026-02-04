import { Description } from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { useMemo, useState } from 'react';

import { AIIcon } from '@/components/icons/ai-icon';
import { Button } from '@/components/ui/button';
import { ScoreChart } from '@/components/ui/charts/score-chart/score-chart';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { dialogVariants } from '@/components/ui/dialog/utils/dialog-variants';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Body1, Body3, H3, H4 } from '@/components/ui/typography';
import { useAssistantStore } from '@/features/messages/stores/assistant-store';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';
import { useUser } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { Biomarker, Category } from '@/types/api';
import { generateUUID } from '@/utils/generate-uiud';

import { PersonalizedExplanation } from '../personalized-explanation';

export const CategoryDialog = ({
  children,
  category,
  biomarkers,
  disabled = false,
}: {
  children: React.ReactNode;
  category: Category;
  biomarkers: Biomarker[];
  disabled?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const { width } = useWindowDimensions();
  const { data: user } = useUser();
  const { openWithMessages } = useAssistantStore();

  const stats = useMemo(() => {
    const total = biomarkers.length;
    let optimal = 0;
    let inRange = 0;
    let outOfRange = 0;

    for (const b of biomarkers) {
      if (b.status === 'OPTIMAL') optimal += 1;
      else if (b.status === 'NORMAL') inRange += 1;
      else if (b.status === 'HIGH' || b.status === 'LOW') outOfRange += 1;
    }

    return { total, optimal, inRange, outOfRange };
  }, [biomarkers]);

  const statsItems = [
    { label: 'Total biomarkers', value: stats.total },
    { label: 'Optimal', value: stats.optimal },
    { label: 'In range', value: stats.inRange },
    { label: 'Out of range', value: stats.outOfRange },
  ];

  const showStats = stats.total > 0;

  const content = (
    <div className="space-y-4">
      <div className="-mt-3 flex items-center justify-between px-6">
        <DialogTitle>
          <Body1 className="line-clamp-2 text-zinc-400">
            {category.category}
          </Body1>
        </DialogTitle>
        <div className="-mr-3 ml-2 flex items-center gap-2">
          <DialogClose asChild>
            <Button variant="ghost" className="text-zinc-400">
              <X strokeWidth={2.5} className="size-4" />
            </Button>
          </DialogClose>
        </div>
      </div>
      <div className="flex w-full flex-col items-center gap-6 px-6">
        <ScoreChart biomarkers={biomarkers} value={category.value} />
        <H4 className="text-center">{category.category}</H4>
        {showStats && (
          <div className="grid w-full gap-2 min-[375px]:grid-cols-4">
            {statsItems.map((item) => (
              <div
                key={item.label}
                className="flex flex-col gap-1 rounded-2xl bg-zinc-100 px-3 pb-1 pt-2"
              >
                <Body3 className="text-secondary">{item.label}</Body3>
                <H4 className="truncate">{item.value}</H4>
              </div>
            ))}
          </div>
        )}
      </div>
      <div>
        <div className="flex w-full flex-wrap items-center justify-between border-b px-6">
          <Body1 className="border-b-2 border-black py-3 font-medium">
            Explanation
          </Body1>
          <Button
            onClick={() => {
              const presetMessage = `Hi ${user?.firstName ?? 'there'}, what would you like to update about your medical history? This could be things like a new therapy, updated diet, new habits or anything else you would like us to remember about you.`;
              openWithMessages([
                {
                  id: generateUUID(),
                  role: 'assistant',
                  parts: [{ type: 'text', text: presetMessage }],
                },
              ]);
            }}
            variant="outline"
            size="small"
            className="gap-2"
          >
            <AIIcon className="size-4" />
            Update personalization
          </Button>
        </div>
        <div className="space-y-4 px-6 pt-8">
          <H3>Your {category.category} insights</H3>
          <PersonalizedExplanation
            key={category.category}
            category={category.category}
          />
          <Description hidden>Insights about {category.category}</Description>
        </div>
      </div>
    </div>
  );

  if (width <= 1024) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          asChild
          disabled={disabled}
          className={cn(disabled && 'pointer-events-none')}
        >
          {children}
        </SheetTrigger>
        <SheetContent className="flex h-[calc(100vh-6rem)] flex-col rounded-t-3xl py-4 pt-7 md:p-8">
          {content}
        </SheetContent>
      </Sheet>
    );
  }

  return (
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
          'flex flex-col !px-0 overflow-x-hidden gap-0',
          dialogVariants({ size: '2xlarge' }),
          'md:min-h-[750px] max-h-[70vh]',
        )}
      >
        {content}
      </DialogContent>
    </Dialog>
  );
};
