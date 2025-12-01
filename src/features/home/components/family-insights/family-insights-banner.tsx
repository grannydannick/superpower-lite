import { DialogClose } from '@radix-ui/react-dialog';
import { ArrowLeft, ArrowRight, ChevronRight, Dot, X } from 'lucide-react';
import { ReactNode, useState } from 'react';

import { AIIcon } from '@/components/icons/ai-icon';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import { Body2, H3 } from '@/components/ui/typography';
import { useQuestionnaireInsights } from '@/features/questionnaires/api/get-questionnaire-insights';
import { useAnalytics } from '@/hooks/use-analytics';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';
import { QuestionnaireInsights } from '@/types/api';
import { handleShare } from '@/utils/share';

// TODO: god damn it we should standarize fonts across the app
// TODO 2: I didnt find better way to use that background image...
export const FamilyInsightsBanner = () => {
  return (
    <FamilyInsightsDialog>
      <div className="mb-6 md:pl-9">
        <div
          className="flex items-center gap-4 rounded-[20px] bg-cover bg-no-repeat px-6 py-2 shadow-[0_0_4px_rgba(24,24,27,0.1)]"
          style={{
            backgroundImage: `
      url('/home/health-insights-banner.png'),
      linear-gradient(135deg, #252F22 0%, #252F22 20%, #43523A 60%, #4C4F2F 100%)
    `,
          }}
        >
          <div className="size-20 lg:w-28 xl:w-36" />
          <div className="flex-1">
            <H3 className="text-base text-white">
              Review family health insights
              <br /> from your intake
            </H3>
          </div>
          <ChevronRight className="size-5 min-w-5 text-zinc-400" />
        </div>
      </div>
    </FamilyInsightsDialog>
  );
};

const FamilyInsightsDialog = ({ children }: { children: ReactNode }) => {
  const [current, setCurrent] = useState(0);
  const { width } = useWindowDimensions();
  const { data } = useQuestionnaireInsights({
    questionnaireName: 'onboarding-intake',
  });
  const { track } = useAnalytics();

  const onNextInsight = () => {
    setCurrent((prev) => prev + 1);
  };

  const onPrevInsight = () => {
    setCurrent((prev) => prev - 1);
  };

  const shareInsight = (insight: QuestionnaireInsights) => {
    track('shared_intake_risk_card');
    handleShare(insight.sms);
  };

  // Only render when insights are available
  if (!data || data.insights.length === 0) return null;

  const insight = data.insights[current];

  const content = (
    <div className="flex flex-col lg:flex-row lg:gap-6 lg:p-2">
      <DialogClose className="absolute right-4 top-4 rounded-sm text-white opacity-70 lg:text-zinc-400">
        <X className="size-4" />
        <span className="sr-only">Close</span>
      </DialogClose>
      <img
        src="/home/health-insights.png"
        alt="health-insights"
        className="h-[259px] min-w-0 object-cover lg:h-auto lg:min-w-[448px] lg:rounded-3xl"
      />

      <div className="flex flex-col gap-4 p-6 lg:gap-6 lg:p-12">
        <div className="flex w-full items-center justify-between">
          {current > 0 ? (
            <Button
              size="icon"
              variant="ghost"
              className="gap-1"
              onClick={onPrevInsight}
            >
              <ArrowLeft className="size-4" />
              Back
            </Button>
          ) : (
            <div />
          )}
          {data.insights.length - 1 !== current ? (
            <Button
              size="icon"
              variant="ghost"
              className="gap-1"
              onClick={onNextInsight}
            >
              Next
              <ArrowRight className="size-4" />
            </Button>
          ) : null}
        </div>
        <H3 className="text-[22px]">{insight.title}</H3>
        <div className="flex gap-3">
          <AIIcon className="size-6 min-w-6" />
          <div>
            <Body2 className="text-vermillion-900">Why this matters:</Body2>
            <Body2>{insight.description}</Body2>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <Body2>When your results arrive, check for related markers:</Body2>
          <ul className="-ml-2">
            {insight.recommendations.map((r) => (
              <li
                className="flex items-center gap-1"
                key={r.toLocaleLowerCase()}
              >
                <Dot className="shrink-0 text-zinc-300" />
                <Body2>{r}</Body2>
              </li>
            ))}
          </ul>
          <Body2>
            Have family members you think may also be at risk? Help them take
            action!
          </Body2>
        </div>
        <Button
          size={width < 1024 ? 'medium' : 'small'}
          variant={width < 1024 ? 'outline' : 'default'}
          className="w-full px-4 lg:w-fit"
          onClick={() => shareInsight(insight)}
        >
          Share this with your family
        </Button>
      </div>
    </div>
  );

  if (width < 1024) {
    return (
      <Sheet>
        <SheetTrigger asChild onClick={() => track('clicked_family_CTA')}>
          {children}
        </SheetTrigger>
        <SheetContent className="flex max-h-full flex-col rounded-t-[10px] border-none">
          {content}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild onClick={() => track('clicked_family_CTA')}>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-[1000px] overflow-y-auto rounded-s-[30px]">
        {content}
      </DialogContent>
    </Dialog>
  );
};
