'use client';

import * as React from 'react';
import { useLocation } from 'react-router-dom';

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { INTAKE_QUESTIONNAIRE } from '@/const/questionnaire';
import { STEP_IDS } from '@/features/onboarding/config/step-config';
import { useOnboardingFlowStore } from '@/features/onboarding/stores/onboarding-flow-store';
import { useQuestionnaireResponse } from '@/features/questionnaires/api/get-questionnaire-response';
import { useQuestionnaire } from '@/features/questionnaires/api/questionnaire';
import {
  useCreateQuestionnaireResponse,
  useQuestionnaireResponseList,
  useUpdateQuestionnaireResponse,
} from '@/features/questionnaires/api/questionnaire-response';
import { useUpdateQuestionnaireResponse as useUpdateIntakeQuestionnaireResponse } from '@/features/questionnaires/api/update-questionnaire-response';
import { DEV_BYPASS_CARE_PLAN_KEY } from '@/features/summary/api/get-summary';

import { toast } from '../ui/sonner';

const ONBOARDING_QUESTIONNAIRES = [
  'onboarding-primer',
  'onboarding-medical-history',
  'onboarding-female-health',
  'onboarding-lifestyle',
] as const;

export function DevHelper() {
  const isDev = process.env.NODE_ENV === 'development';
  const location = useLocation();
  const isOnboarding = location.pathname === '/onboarding';

  const [open, setOpen] = React.useState(false);
  const [bypassCarePlan, setBypassCarePlan] = React.useState(() =>
    typeof window !== 'undefined'
      ? localStorage.getItem(DEV_BYPASS_CARE_PLAN_KEY) === 'true'
      : false,
  );

  const goToStep = useOnboardingFlowStore((state) => state.goTo);
  const updateQuestionnaireResponseMutation = useUpdateQuestionnaireResponse();
  const createQuestionnaireResponseMutation = useCreateQuestionnaireResponse();
  const updateIntakeQuestionnaireResponseMutation =
    useUpdateIntakeQuestionnaireResponse({
      mutationConfig: {
        onSuccess: () => {
          toast.success('Completed intake, refreshing...');
          window.location.reload();
        },
      },
    });
  const getQuestionnaireResponseQuery = useQuestionnaireResponse({
    identifier: INTAKE_QUESTIONNAIRE,
    statuses: ['in-progress', 'stopped'],
  });

  const questionnaireResponseId =
    getQuestionnaireResponseQuery.data?.questionnaireResponse?.id ||
    INTAKE_QUESTIONNAIRE;

  const onboardingPrimerQuery = useQuestionnaire({
    identifier: ONBOARDING_QUESTIONNAIRES[0],
    queryConfig: { enabled: isDev },
  });
  const onboardingMedicalHistoryQuery = useQuestionnaire({
    identifier: ONBOARDING_QUESTIONNAIRES[1],
    queryConfig: { enabled: isDev },
  });
  const onboardingFemaleHealthQuery = useQuestionnaire({
    identifier: ONBOARDING_QUESTIONNAIRES[2],
    queryConfig: { enabled: isDev },
  });
  const onboardingLifestyleQuery = useQuestionnaire({
    identifier: ONBOARDING_QUESTIONNAIRES[3],
    queryConfig: { enabled: isDev },
  });
  const questionnaireQueries = [
    onboardingPrimerQuery,
    onboardingMedicalHistoryQuery,
    onboardingFemaleHealthQuery,
    onboardingLifestyleQuery,
  ];

  // Fetch all onboarding questionnaire responses
  const questionnaireResponsesQuery = useQuestionnaireResponseList(
    {
      questionnaireName: ONBOARDING_QUESTIONNAIRES.join(','),
      status: 'in-progress,completed,stopped',
    },
    { enabled: isDev },
  );

  const getQuestionnaireId = (questionnaireName: string) => {
    const index = ONBOARDING_QUESTIONNAIRES.indexOf(
      questionnaireName as (typeof ONBOARDING_QUESTIONNAIRES)[number],
    );
    return questionnaireQueries[index]?.data?.questionnaire?.id;
  };

  const findQuestionnaireResponse = (questionnaireName: string) => {
    const responses = questionnaireResponsesQuery.data ?? [];
    const questionnaireId = getQuestionnaireId(questionnaireName);

    return (
      responses.find((response) =>
        questionnaireId
          ? response.questionnaire?.includes(questionnaireId)
          : response.questionnaire?.includes(questionnaireName),
      ) ??
      responses.find((response) =>
        response.questionnaire?.includes(questionnaireName),
      )
    );
  };

  const onCompleteIntake = () => {
    if (
      getQuestionnaireResponseQuery.data?.questionnaireResponse?.status ===
      'completed'
    ) {
      toast.info('Intake already completed');
      return;
    }

    updateIntakeQuestionnaireResponseMutation.mutate({
      data: { status: 'completed', item: [] },
      identifier: questionnaireResponseId,
      invalidateIdentifiers: [INTAKE_QUESTIONNAIRE],
    });
  };

  const onCompleteAllQuestionnaires = async () => {
    if (questionnaireResponsesQuery.isLoading) {
      toast.error('Questionnaire responses are still loading');
      return;
    }

    const responses = questionnaireResponsesQuery.data ?? [];
    const hasWork =
      responses.some((response) => response.status !== 'completed') ||
      ONBOARDING_QUESTIONNAIRES.some(
        (name) => !findQuestionnaireResponse(name),
      );

    if (!hasWork) {
      toast.info('All questionnaires already completed');
      return;
    }

    toast.info('Completing questionnaires...');

    // Complete each questionnaire sequentially
    for (const questionnaireName of ONBOARDING_QUESTIONNAIRES) {
      const response = findQuestionnaireResponse(questionnaireName);

      if (response?.status === 'completed') {
        continue;
      }

      if (response?.id) {
        await updateQuestionnaireResponseMutation.mutateAsync({
          id: response.id,
          data: { status: 'completed', item: [] },
        });
        continue;
      }

      const questionnaireId = getQuestionnaireId(questionnaireName);
      if (!questionnaireId) {
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

    if (!response) {
      const questionnaireId = getQuestionnaireId(questionnaireName);
      if (!questionnaireId) {
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

    if (response.id) {
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

  const sequenceSteps = [
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
          <CommandGroup heading="Intake Actions">
            <CommandItem
              onSelect={() => {
                onCompleteIntake();
                setOpen(false);
              }}
            >
              <span>Complete intake</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                const newValue = !bypassCarePlan;
                localStorage.setItem(
                  DEV_BYPASS_CARE_PLAN_KEY,
                  newValue.toString(),
                );
                setBypassCarePlan(newValue);
                toast.success(
                  `Bypass care plan: ${newValue ? 'ON' : 'OFF'}. Refreshing...`,
                );
                window.location.reload();
              }}
            >
              <span>
                Bypass care plan check [{bypassCarePlan ? 'ON' : 'OFF'}]
              </span>
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Questionnaire Actions">
            <CommandItem
              onSelect={() => {
                onCompleteAllQuestionnaires();
                setOpen(false);
              }}
            >
              <span>Complete All Questionnaires</span>
            </CommandItem>
            {ONBOARDING_QUESTIONNAIRES.map((name) => (
              <CommandItem
                key={name}
                onSelect={() => {
                  onCompleteQuestionnaire(name);
                  setOpen(false);
                }}
              >
                <span>Complete {name}</span>
              </CommandItem>
            ))}
          </CommandGroup>

          {isOnboarding && (
            <>
              <CommandGroup heading="Jump to Sequences">
                {sequenceSteps.map((step) => (
                  <CommandItem
                    key={step.id}
                    onSelect={() => {
                      onJumpToStep(step.id);
                      setOpen(false);
                    }}
                  >
                    <span>{step.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
