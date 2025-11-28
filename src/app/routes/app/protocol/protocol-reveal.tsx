import { useEffect } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';

import { Head } from '@/components/seo';
import { Spinner } from '@/components/ui/spinner';
import { useRevealLatest } from '@/features/protocol/api';
import type { Protocol } from '@/features/protocol/api/get-protocol';
import {
  REVEAL_STEPS,
  useRevealStepper,
} from '@/features/protocol/components/reveal/reveal-stepper';
import { BiologicalAgeStep } from '@/features/protocol/components/reveal/steps/biological-age-step';
import { BiomarkersStep } from '@/features/protocol/components/reveal/steps/biomarkers-step';
import { GetStartedStep } from '@/features/protocol/components/reveal/steps/get-started-step';
import { GoalStep } from '@/features/protocol/components/reveal/steps/goal-step';
import { HealthScoreStep } from '@/features/protocol/components/reveal/steps/health-score-step';
import { OrderSummaryStep } from '@/features/protocol/components/reveal/steps/order-summary-step';
import { ProductCheckoutStep } from '@/features/protocol/components/reveal/steps/product-checkout-step';
import { RxQuestionnaireStep } from '@/features/protocol/components/reveal/steps/rx-questionnaire-step';
import { ServiceBookingStep } from '@/features/protocol/components/reveal/steps/service-booking-step';
import { ServiceCheckoutStep } from '@/features/protocol/components/reveal/steps/service-checkout-step';
import { cn } from '@/lib/utils';

/**
 * Route wrapper for the protocol reveal flow
 * Path: /protocol/reveal/:step
 */
export const ProtocolRevealRoute = () => {
  const { step } = useParams<{ step: string }>();
  const navigate = useNavigate();
  const { data: revealData } = useRevealLatest();
  const carePlanId: string | null = revealData?.carePlanId ?? null;
  const { next, previous, initialStep, isLoading, baseSteps, protocol } =
    useRevealStepper(carePlanId ?? undefined, step ?? undefined);

  // Handle initial load: if no step in URL, navigate to initial step
  useEffect(() => {
    if (isLoading || !initialStep) return;

    // If no step in URL, navigate to initial step
    if (!step) {
      navigate(`/protocol/reveal/${initialStep}`, { replace: true });
      return;
    }

    // Validate step against known steps
    if (!baseSteps.includes(step)) {
      navigate(`/protocol/reveal/${initialStep}`, { replace: true });
    }
  }, [step, isLoading, initialStep, baseSteps, navigate]);

  if (isLoading) {
    return (
      <>
        <Head title="Your Health Protocol" />
        <div className="flex min-h-[60vh] items-center justify-center">
          <Spinner variant="primary" />
        </div>
      </>
    );
  }

  if (revealData?.revealCompleted) {
    return <Navigate to="/protocol" replace />;
  }

  // Validate required data - fail if missing
  if (!carePlanId || !protocol) {
    console.error('Missing care plan id or protocol', {
      carePlanId,
      protocol,
    });
    return <Navigate to="/protocol" replace />;
  }

  const currentStepId =
    (step && baseSteps.includes(step) ? step : initialStep) ?? initialStep;

  return (
    <ProtocolRevealContent
      carePlanId={carePlanId}
      protocol={protocol}
      next={next}
      previous={previous}
      currentStepId={currentStepId}
    />
  );
};

type ProtocolRevealContentProps = {
  carePlanId: string;
  protocol: Protocol;
  next: () => void;
  previous: () => void;
  currentStepId: string;
};

const ProtocolRevealContent = ({
  carePlanId,
  protocol,
  next,
  previous,
  currentStepId,
}: ProtocolRevealContentProps) => {
  const renderGoalStep = () => {
    const goalId = currentStepId.replace('goal-', '');
    const goal = protocol.goals.find((g) => g.id === goalId);

    if (!goal) {
      console.error('Unknown goal step', { currentStepId });
      return null;
    }

    const goalActivities =
      protocol.activities.filter(
        (activity) =>
          ['product', 'service', 'prescription'].includes(activity.type) &&
          activity.goalIds.includes(goal.id),
      ) || [];

    return (
      <GoalStep
        goal={goal}
        activities={goalActivities}
        allGoals={protocol.goals}
        next={next}
        previous={previous}
      />
    );
  };

  const renderCurrentStep = () => {
    switch (currentStepId) {
      case REVEAL_STEPS.GET_STARTED:
        return <GetStartedStep next={next} />;
      case REVEAL_STEPS.BIOLOGICAL_AGE:
        return <BiologicalAgeStep next={next} previous={previous} />;
      case REVEAL_STEPS.SCORE:
        return <HealthScoreStep next={next} previous={previous} />;
      case REVEAL_STEPS.BIOMARKERS:
        return (
          <BiomarkersStep
            carePlanId={carePlanId}
            next={next}
            previous={previous}
          />
        );
      case REVEAL_STEPS.ORDER_SUMMARY:
        return (
          <OrderSummaryStep
            goals={protocol?.goals}
            activities={protocol?.activities}
            next={next}
            previous={previous}
          />
        );
      case REVEAL_STEPS.PRODUCT_CHECKOUT:
        return (
          <ProductCheckoutStep
            carePlanId={carePlanId}
            next={next}
            previous={previous}
          />
        );
      case REVEAL_STEPS.SERVICE_CHECKOUT:
        return (
          <ServiceCheckoutStep
            carePlanId={carePlanId}
            next={next}
            previous={previous}
          />
        );
      case REVEAL_STEPS.SERVICE_BOOKING:
        return (
          <ServiceBookingStep
            carePlanId={carePlanId}
            next={next}
            previous={previous}
          />
        );
      case REVEAL_STEPS.RX_QUESTIONNAIRE:
        return (
          <RxQuestionnaireStep
            carePlanId={carePlanId}
            activities={protocol?.activities}
            next={next}
          />
        );
      default:
        if (currentStepId.startsWith('goal-')) {
          return renderGoalStep();
        }

        console.error('Unknown reveal step', { currentStepId });
        return null;
    }
  };

  return (
    <>
      <Head title="Your Health Protocol" />
      <div className={cn('')}>{renderCurrentStep()}</div>
    </>
  );
};
