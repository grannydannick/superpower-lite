import {
  Questionnaire,
  QuestionnaireResponse,
  QuestionnaireResponseItem,
} from '@medplum/fhirtypes';
import { useMemo } from 'react';

import { Head } from '@/components/seo';
import { QuestionnaireForm } from '@/components/ui/questionnaire';
import { Spinner } from '@/components/ui/spinner';
import { useQuestionnaireResponseController } from '@/features/questionnaires/hooks/use-questionnaire-response-controller';
import { pruneResponseItems } from '@/features/questionnaires/utils/prune-response-items';
import { useUser } from '@/lib/auth';

import { useOnboardingNavigation } from '../../../hooks/use-onboarding-navigation';

type Props = {
  questionnaireName: string;
};

/**
 * Generic onboarding questionnaire step component.
 * Renders any questionnaire by name with auto-save and auto-advance on submit.
 * Creates a questionnaire response on first save/submit if missing.
 */
const QUESTIONNAIRE_TITLES: Record<string, string> = {
  'onboarding-primer': 'About You',
  'onboarding-medical-history': 'Medical History',
  'onboarding-female-health': 'Female Health',
  'onboarding-lifestyle': 'Lifestyle',
};

export const OnboardingQuestionnaireStep = ({ questionnaireName }: Props) => {
  const { next } = useOnboardingNavigation();
  const userQuery = useUser();

  const pageTitle = useMemo(
    () => QUESTIONNAIRE_TITLES[questionnaireName] || 'Questionnaire',
    [questionnaireName],
  );
  const {
    questionnaire,
    response: questionnaireResponse,
    isLoading: isQuestionnaireLoading,
    save,
    submit,
  } = useQuestionnaireResponseController({
    questionnaireName,
    statuses: ['in-progress', 'completed', 'stopped'],
    normalizeItems: pruneResponseItems,
  });

  // Show loading while fetching core data
  if (isQuestionnaireLoading || userQuery.isLoading) {
    return (
      <div className="flex h-dvh w-full items-center justify-center">
        <Spinner variant="primary" size="md" />
      </div>
    );
  }

  if (!questionnaire || !userQuery.data) {
    return null;
  }

  const handleSave = async (item: QuestionnaireResponseItem[]) => {
    await save(item);
  };

  const handleSubmit = async (item: QuestionnaireResponseItem[]) => {
    await submit(item, { onSuccess: next });
  };

  return (
    <>
      <Head title={pageTitle} />
      <QuestionnaireForm
        questionnaire={questionnaire as unknown as Questionnaire}
        response={questionnaireResponse as unknown as QuestionnaireResponse}
        user={userQuery.data}
        onSave={handleSave}
        onSubmit={handleSubmit}
        // HACK: floor the initial progress while question count is conditional.
        initialProgressPercent={
          questionnaireName === 'onboarding-female-health' ? 35 : undefined
        }
        className="space-y-6"
      />
    </>
  );
};
