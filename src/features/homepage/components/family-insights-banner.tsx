import { DialogClose } from '@radix-ui/react-dialog';
import { ChevronLeft, ChevronRight, Dot, X } from 'lucide-react';
import { ReactNode, useState } from 'react';

import { AIIcon } from '@/components/icons/ai-icon';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import { Body1, Body2, H3 } from '@/components/ui/typography';
import { useLatestFamilyRiskPlan } from '@/features/family-risks';
import { useQuestionnaireInsights } from '@/features/questionnaires/api/get-questionnaire-insights';
import { useAnalytics } from '@/hooks/use-analytics';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';
import { QuestionnaireInsights } from '@/types/api';
import { handleShare } from '@/utils/share';

// Mock insights used as a fallback when API data isn't available (development only)
const MOCK_INSIGHTS: QuestionnaireInsights[] = [
  {
    title: 'Family history suggests cardiometabolic risk',
    description:
      'A family history of type 2 diabetes and high cholesterol can raise your own risk. Early lifestyle changes and periodic labs help prevent complications.',
    sms: 'Heads up — our intake suggests higher diabetes/heart risk. Can you take the quick intake too so we can spot risks early?',
    recommendations: [
      'HbA1c',
      'Fasting glucose',
      'Lipid panel (LDL, HDL, TG)',
      'ApoB',
      'hs-CRP',
    ],
  },
  {
    title: 'Possible thyroid imbalance in the family',
    description:
      'Symptoms and family history point to checking thyroid function. Thyroid conditions often run in families and are very treatable when caught early.',
    sms: 'Our intake flagged possible thyroid risk. Consider screening — catching it early makes treatment easier.',
    recommendations: [
      'TSH',
      'Free T4',
      'Free T3',
      'TPO antibodies',
      'Thyroglobulin antibodies',
    ],
  },
  {
    title: 'Inflammation and gut health signals',
    description:
      'Digestive symptoms and autoimmune history can reflect gut imbalance and systemic inflammation. A few markers can help clarify root causes.',
    sms: 'FYI: Our intake flagged possible gut/inflammation issues. Worth checking a few markers together?',
    recommendations: [
      'Calprotectin (stool)',
      'Zonulin',
      'Vitamin D (25-OH)',
      'Ferritin',
      'hs-CRP',
    ],
  },
];

// TODO: god damn it we should standarize fonts across the app
// TODO 2: I didnt find better way to use that background image...
export const FamilyInsightsBanner = () => {
  const { data: familyRiskPlan } = useLatestFamilyRiskPlan();

  // Don't show intake insights banner if family risk plan is available
  if (familyRiskPlan?.risks?.length) {
    return null;
  }

  return (
    <FamilyInsightsDialog>
      <div className="mb-6">
        <div
          className="group flex cursor-pointer items-center gap-4 rounded-[20px] bg-cover bg-no-repeat px-6 py-2 shadow-[0_0_4px_rgba(24,24,27,0.1)]"
          style={{
            backgroundImage: `
      url('/home/health-insights-banner.png'),
      linear-gradient(135deg, #252F22 0%, #252F22 20%, #43523A 60%, #4C4F2F 100%)
    `,
          }}
        >
          <div className="size-20 lg:w-28 xl:w-36" />
          <div className="flex-1">
            <Body1 className="text-base text-white">
              Review family health insights
              <br /> from your intake
            </Body1>
          </div>
          <ChevronRight className="size-5 text-white transition-all group-hover:-mr-1" />
        </div>
      </div>
    </FamilyInsightsDialog>
  );
};

const FamilyInsightsDialog = ({ children }: { children: ReactNode }) => {
  const [current, setCurrent] = useState(0);
  const { width } = useWindowDimensions();
  const { data, isLoading } = useQuestionnaireInsights({
    questionnaireName: 'onboarding-intake',
  });
  const { track } = useAnalytics();

  const isDev = import.meta.env.DEV;

  const questionnaireInsights = data?.insights ?? [];
  const shouldUseMock = isDev && questionnaireInsights.length === 0;

  const insights = shouldUseMock ? MOCK_INSIGHTS : questionnaireInsights;

  if (!insights || !insights.length) return null;

  const onNextInsight = () => {
    setCurrent((prev) => Math.min(prev + 1, insights.length - 1));
  };

  const onPrevInsight = () => {
    setCurrent((prev) => Math.max(prev - 1, 0));
  };

  const shareInsight = (insight: QuestionnaireInsights) => {
    track('shared_intake_risk_card');
    handleShare(insight.sms);
  };

  // Only render when insights are available
  const insight = insights[current];

  const content = (
    <div className="flex flex-col lg:flex-row lg:gap-6 lg:p-2">
      <DialogClose className="absolute right-6 top-6 rounded-sm text-white transition-all duration-200 lg:text-zinc-400 lg:hover:text-secondary">
        <X className="size-4" />
        <span className="sr-only">Close</span>
      </DialogClose>
      <img
        src="/home/health-insights.png"
        alt="health-insights"
        className="h-[259px] object-cover lg:h-auto lg:min-w-[448px] lg:rounded-3xl"
      />

      <div className="flex flex-col gap-4 p-6 lg:gap-6 lg:p-8 lg:pt-3">
        <div className="-ml-1 flex w-full items-center gap-0.5 pr-4">
          <Button
            size="icon"
            variant="ghost"
            className="clear-start size-8 gap-1 hover:bg-zinc-100 lg:size-6 lg:rounded-md"
            onClick={onPrevInsight}
            disabled={current === 0 || isLoading}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="clear-start size-8 gap-1 hover:bg-zinc-100 lg:size-6 lg:rounded-md"
            onClick={onNextInsight}
            disabled={insights.length - 1 === current || isLoading}
          >
            <ChevronRight className="size-4" />
          </Button>
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
          <Body2>Have family members you think may also be at risk?</Body2>
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
