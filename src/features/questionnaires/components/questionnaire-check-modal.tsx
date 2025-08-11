import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogContent } from '@/components/ui/dialog';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Body1, Body2, H3 } from '@/components/ui/typography';
import {
  INTAKE_QUESTIONNAIRE,
  ONBOARDING_SCREENING,
} from '@/const/questionnaire';
import { useQuestionnaireResponse } from '@/features/questionnaires/api/get-questionnaire-response';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';
import { useUser } from '@/lib/auth';

const whitelistedPaths = ['/questionnaire', '/onboarding'];

export function QuestionnaireCheckModal() {
  const [missing, setMissing] = useState<boolean>(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { width } = useWindowDimensions();
  const { data: user } = useUser();

  const { data: screening } = useQuestionnaireResponse({
    questionnaireName: ONBOARDING_SCREENING,
  });
  const { data: intake } = useQuestionnaireResponse({
    questionnaireName: INTAKE_QUESTIONNAIRE,
  });

  const screeningStatus = screening?.questionnaireResponse?.status;
  const intakeStatus = intake?.questionnaireResponse?.status;

  useEffect(() => {
    if (whitelistedPaths.some((p) => pathname.includes(p))) {
      setMissing(false);
      return;
    }

    if (screeningStatus === undefined && intakeStatus === undefined) return;

    const statuses = [screeningStatus, intakeStatus].filter(Boolean);

    // show modal only if at least one response exists AND any is incomplete
    setMissing(statuses.length > 0 && statuses.some((s) => s !== 'completed'));
  }, [pathname, screeningStatus, intakeStatus]);

  // disable this for ops
  if (user?.adminActor) {
    return;
  }

  const handleClick = () => {
    if (
      screeningStatus &&
      intakeStatus &&
      screeningStatus !== 'completed' &&
      intakeStatus !== 'completed'
    ) {
      return navigate('/questionnaire/all');
    }
    if (intakeStatus && intakeStatus !== 'completed') {
      return navigate('/questionnaire/intake');
    }
    if (screeningStatus && screeningStatus !== 'completed') {
      return navigate('/questionnaire/screening');
    }
  };

  const content = (
    <div className="flex size-full flex-col items-center justify-between">
      <div>
        <img
          src="/onboarding/mockup-flat.webp"
          alt="Mockup Flat"
          className="w-full"
        />
        <div className="mx-auto max-w-xs md:max-w-sm">
          <H3 className="my-2 text-center text-3xl">
            Complete your health story survey
          </H3>
          <Body1 className="mb-4 text-center text-zinc-500">
            Unlock more personalized insights in your health dashboard. It takes
            15 min to finish
          </Body1>
        </div>
      </div>
      <Button onClick={handleClick} className="w-full rounded-full md:mt-8">
        Get started
      </Button>
    </div>
  );

  if (width <= 768) {
    return (
      <Sheet
        open={missing}
        onOpenChange={(isOpen) => {
          // Only allow the sheet to be opened, not closed
          if (!isOpen) return;
          setMissing(isOpen);
        }}
      >
        <SheetContent className="flex h-screen max-h-full flex-col">
          <div className="flex items-center justify-between px-4 pt-16 md:pb-4">
            <div className="min-w-[44px]" />
            <Body2>Complete Survey</Body2>
            <div className="min-w-[44px]" />
          </div>
          <div className="flex-1 overflow-auto p-6 py-12">{content}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <AlertDialog open={missing}>
      <AlertDialogContent className="mb-8 flex max-w-lg flex-col justify-between rounded-3xl bg-white p-6 py-12 md:h-auto md:p-8">
        {content}
      </AlertDialogContent>
    </AlertDialog>
  );
}
