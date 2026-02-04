'use client';

import * as React from 'react';

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { INTAKE_QUESTIONNAIRE } from '@/const/questionnaire';
import { useQuestionnaireResponse } from '@/features/questionnaires/api/get-questionnaire-response';
import { useUpdateQuestionnaireResponse } from '@/features/questionnaires/api/update-questionnaire-response';
import { DEV_BYPASS_CARE_PLAN_KEY } from '@/features/summary/api/get-summary';

import { toast } from '../ui/sonner';

export function DevHelper() {
  const isDev = process.env.NODE_ENV === 'development';

  const [open, setOpen] = React.useState(false);
  const [bypassCarePlan, setBypassCarePlan] = React.useState(() =>
    typeof window !== 'undefined'
      ? localStorage.getItem(DEV_BYPASS_CARE_PLAN_KEY) === 'true'
      : false,
  );
  const updateQuestionnaireResponseMutation = useUpdateQuestionnaireResponse({
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

  const onOnboardingTaskClick = async () => {
    if (
      getQuestionnaireResponseQuery.data?.questionnaireResponse?.status ===
      'completed'
    ) {
      toast.info('Already completed');
      return;
    }

    updateQuestionnaireResponseMutation.mutate({
      data: { status: 'completed', item: [] },
      identifier: questionnaireResponseId,
      invalidateIdentifiers: [INTAKE_QUESTIONNAIRE],
    });
  };

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
          <CommandGroup heading="This is only available in DEV env.">
            <CommandItem
              onSelect={() => {
                onOnboardingTaskClick();
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
        </CommandList>
      </CommandDialog>
    </>
  );
}
