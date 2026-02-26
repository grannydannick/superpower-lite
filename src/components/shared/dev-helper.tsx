'use client';

import { useMatchRoute } from '@tanstack/react-router';
import * as React from 'react';

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { env } from '@/config/env';
import type { StepId } from '@/features/onboarding/config/step-config';
import { STEP_IDS } from '@/features/onboarding/config/step-config';
import { useOnboardingFlowStore } from '@/features/onboarding/stores/onboarding-flow-store';
import {
  useCompleteReveal,
  useResetReveal,
  useRevealLatest,
} from '@/features/protocol/api/reveal';
import { useQuestionnaire } from '@/features/questionnaires/api/questionnaire';
import {
  useCreateQuestionnaireResponse,
  useQuestionnaireResponseList,
  useUpdateQuestionnaireResponse,
} from '@/features/questionnaires/api/questionnaire-response';
import { DEV_BYPASS_CARE_PLAN_KEY } from '@/features/summary/api/get-summary';

import { toast } from '../ui/sonner';

const ONBOARDING_QUESTIONNAIRES = [
  'onboarding-primer',
  'onboarding-medical-history',
  'onboarding-female-health',
  'onboarding-lifestyle',
] as const;

const SEQUENCE_STEPS: Array<{ id: StepId; label: string }> = [
  { id: STEP_IDS.INTRODUCTION, label: 'Introduction Sequence' },
  { id: STEP_IDS.DIGITAL_TWIN, label: 'Digital Twin Sequence' },
  { id: STEP_IDS.FINISH_TWIN, label: 'Finish Twin Sequence' },
  { id: STEP_IDS.PRIMER, label: 'Primer Questionnaire' },
  { id: STEP_IDS.MEDICAL_HISTORY, label: 'Medical History Questionnaire' },
  { id: STEP_IDS.FEMALE_HEALTH, label: 'Female Health Questionnaire' },
  { id: STEP_IDS.LIFESTYLE, label: 'Lifestyle Questionnaire' },
  { id: STEP_IDS.UPSELL_PANELS, label: 'Upsell Sequence' },
  { id: STEP_IDS.COMMITMENT, label: 'Commitment Sequence' },
];

export function DevHelper() {
  const isDev = env.DEV_TOOLS_ENABLED;

  const [open, setOpen] = React.useState(false);
  const [bypassCarePlan, setBypassCarePlan] = React.useState(() =>
    typeof window !== 'undefined'
      ? localStorage.getItem(DEV_BYPASS_CARE_PLAN_KEY) === 'true'
      : false,
  );

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (!isDev) return;

      if (e.key === 'd' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [isDev]);

  if (!isDev) return null;

  return (
    <DevHelperMenu open={open} setOpen={setOpen}>
      {open ? (
        <DevHelperMenuContent
          bypassCarePlan={bypassCarePlan}
          setBypassCarePlan={setBypassCarePlan}
          closeMenu={() => setOpen(false)}
        />
      ) : null}
    </DevHelperMenu>
  );
}

interface DevHelperMenuContentProps {
  bypassCarePlan: boolean;
  setBypassCarePlan: React.Dispatch<React.SetStateAction<boolean>>;
  closeMenu: () => void;
}

function DevHelperMenuContent({
  bypassCarePlan,
  setBypassCarePlan,
  closeMenu,
}: DevHelperMenuContentProps) {
  const matchRoute = useMatchRoute();
  const isOnboarding = matchRoute({ to: '/onboarding' }) !== false;

  const goToStep = useOnboardingFlowStore((state) => state.goTo);
  const updateQuestionnaireResponseMutation = useUpdateQuestionnaireResponse();
  const createQuestionnaireResponseMutation = useCreateQuestionnaireResponse();
  const revealLatestQuery = useRevealLatest({ enabled: true });
  const completeRevealMutation = useCompleteReveal();
  const resetRevealMutation = useResetReveal();

  const protocolId = revealLatestQuery.data?.protocolId ?? null;

  const onboardingPrimerQuery = useQuestionnaire({
    identifier: ONBOARDING_QUESTIONNAIRES[0],
  });
  const onboardingMedicalHistoryQuery = useQuestionnaire({
    identifier: ONBOARDING_QUESTIONNAIRES[1],
  });
  const onboardingFemaleHealthQuery = useQuestionnaire({
    identifier: ONBOARDING_QUESTIONNAIRES[2],
  });
  const onboardingLifestyleQuery = useQuestionnaire({
    identifier: ONBOARDING_QUESTIONNAIRES[3],
  });
  const questionnaireQueries = [
    onboardingPrimerQuery,
    onboardingMedicalHistoryQuery,
    onboardingFemaleHealthQuery,
    onboardingLifestyleQuery,
  ];

  const questionnaireResponsesQuery = useQuestionnaireResponseList({
    questionnaireName: ONBOARDING_QUESTIONNAIRES.join(','),
    status: 'in-progress,completed,stopped',
  });

  const getQuestionnaireId = (questionnaireName: string) => {
    let index = 0;
    for (const name of ONBOARDING_QUESTIONNAIRES) {
      if (name === questionnaireName) {
        return questionnaireQueries[index]?.data?.questionnaire?.id;
      }
      index++;
    }
    return undefined;
  };

  const findQuestionnaireResponse = (questionnaireName: string) => {
    const responses = questionnaireResponsesQuery.data;
    if (responses == null) return undefined;

    const questionnaireId = getQuestionnaireId(questionnaireName);
    if (questionnaireId == null) {
      for (const response of responses) {
        if (response.questionnaire?.includes(questionnaireName) === true) {
          return response;
        }
      }
      return undefined;
    }

    let fallback: (typeof responses)[number] | undefined;
    for (const response of responses) {
      if (response.questionnaire?.includes(questionnaireId) === true) {
        return response;
      }

      if (
        fallback == null &&
        response.questionnaire?.includes(questionnaireName) === true
      ) {
        fallback = response;
      }
    }
    return fallback;
  };

  const onCompleteAllQuestionnaires = async () => {
    if (questionnaireResponsesQuery.isLoading) {
      toast.error('Questionnaire responses are still loading');
      return;
    }

    const responses = questionnaireResponsesQuery.data;
    let hasWork = false;

    if (responses != null) {
      for (const response of responses) {
        if (response.status !== 'completed') {
          hasWork = true;
          break;
        }
      }
    }

    if (!hasWork) {
      for (const name of ONBOARDING_QUESTIONNAIRES) {
        const response = findQuestionnaireResponse(name);
        if (response == null) {
          hasWork = true;
          break;
        }
      }
    }

    if (!hasWork) {
      toast.info('All questionnaires already completed');
      return;
    }

    toast.info('Completing questionnaires...');

    for (const questionnaireName of ONBOARDING_QUESTIONNAIRES) {
      const response = findQuestionnaireResponse(questionnaireName);

      if (response?.status === 'completed') {
        continue;
      }

      if (response?.id != null) {
        await updateQuestionnaireResponseMutation.mutateAsync({
          id: response.id,
          data: { status: 'completed', item: [] },
        });
        continue;
      }

      const questionnaireId = getQuestionnaireId(questionnaireName);
      if (questionnaireId == null) {
        toast.error(`Missing questionnaire for ${questionnaireName}`);
        continue;
      }

      await createQuestionnaireResponseMutation.mutateAsync({
        questionnaire: questionnaireId,
        status: 'completed',
        item: [],
      });
    }

    toast.success('All questionnaires completed, refreshing...');
    window.location.reload();
  };

  const onCompleteQuestionnaire = async (questionnaireName: string) => {
    if (questionnaireResponsesQuery.isLoading) {
      toast.error('Questionnaire responses are still loading');
      return;
    }

    const response = findQuestionnaireResponse(questionnaireName);
    if (response == null) {
      const questionnaireId = getQuestionnaireId(questionnaireName);
      if (questionnaireId == null) {
        toast.error(`Missing questionnaire for ${questionnaireName}`);
        return;
      }

      await createQuestionnaireResponseMutation.mutateAsync({
        questionnaire: questionnaireId,
        status: 'completed',
        item: [],
      });
      toast.success(`Created completed ${questionnaireName}, refreshing...`);
      window.location.reload();
      return;
    }

    if (response.status === 'completed') {
      toast.info(`${questionnaireName} already completed`);
      return;
    }

    if (response.id != null) {
      await updateQuestionnaireResponseMutation.mutateAsync({
        id: response.id,
        data: { status: 'completed', item: [] },
      });
      toast.success(`Completed ${questionnaireName}, refreshing...`);
      window.location.reload();
    }
  };

  const onJumpToStep = (stepId: string) => {
    goToStep(stepId as any);
    toast.success(`Jumped to ${stepId}`);
  };

  const onToggleBypassCarePlan = () => {
    const newValue = !bypassCarePlan;
    localStorage.setItem(DEV_BYPASS_CARE_PLAN_KEY, newValue.toString());
    setBypassCarePlan(newValue);
    toast.success(
      `Bypass care plan: ${newValue ? 'ON' : 'OFF'}. Refreshing...`,
    );
    window.location.reload();
  };

  const questionnaireItems: React.ReactElement[] = [];
  for (const name of ONBOARDING_QUESTIONNAIRES) {
    questionnaireItems.push(
      <CommandItem
        key={name}
        onSelect={() => {
          void onCompleteQuestionnaire(name);
          closeMenu();
        }}
      >
        <span>Complete {name}</span>
      </CommandItem>,
    );
  }

  const sequenceItems: React.ReactElement[] = [];
  for (const step of SEQUENCE_STEPS) {
    sequenceItems.push(
      <CommandItem
        key={step.id}
        onSelect={() => {
          onJumpToStep(step.id);
          closeMenu();
        }}
      >
        <span>{step.label}</span>
      </CommandItem>,
    );
  }

  return (
    <>
      <CommandGroup heading="Intake Actions">
        <CommandItem
          onSelect={() => {
            onToggleBypassCarePlan();
            closeMenu();
          }}
        >
          <span>Bypass care plan check [{bypassCarePlan ? 'ON' : 'OFF'}]</span>
        </CommandItem>
      </CommandGroup>

      <CommandGroup heading="Questionnaire Actions">
        <CommandItem
          onSelect={() => {
            void onCompleteAllQuestionnaires();
            closeMenu();
          }}
        >
          <span>Complete All Questionnaires</span>
        </CommandItem>
        {questionnaireItems}
      </CommandGroup>

      <CommandGroup heading="Protocol Reveal">
        <CommandItem
          onSelect={async () => {
            if (!protocolId) {
              toast.error('No revealable protocol found');
              return;
            }
            closeMenu();
            try {
              await resetRevealMutation.mutateAsync(protocolId);
              toast.success('Reveal reset, refreshing...');
              window.location.reload();
            } catch {
              toast.error('Failed to reset reveal');
            }
          }}
        >
          <span>Reset reveal</span>
        </CommandItem>
        <CommandItem
          onSelect={async () => {
            if (!protocolId) {
              toast.error('No revealable protocol found');
              return;
            }
            closeMenu();
            try {
              await completeRevealMutation.mutateAsync(protocolId);
              toast.success('Reveal completed, refreshing...');
              window.location.reload();
            } catch {
              toast.error('Failed to complete reveal');
            }
          }}
        >
          <span>Complete reveal</span>
        </CommandItem>
      </CommandGroup>

      {isOnboarding ? (
        <CommandGroup heading="Jump to Sequences">{sequenceItems}</CommandGroup>
      ) : null}
    </>
  );
}

interface DevHelperMenuProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  children?: React.ReactNode;
}

function DevHelperMenu({ open, setOpen, children }: DevHelperMenuProps) {
  return (
    <>
      <div className="fixed bottom-3 left-3 z-[9999999] flex items-center gap-2 rounded-md border bg-white p-2">
        <p className="text-sm">
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
            <span className="text-xs">⌘</span>D
          </kbd>
        </p>
        <p className="hidden text-[12px] sm:block">Enable DEV menu</p>
      </div>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {children}
        </CommandList>
      </CommandDialog>
    </>
  );
}
