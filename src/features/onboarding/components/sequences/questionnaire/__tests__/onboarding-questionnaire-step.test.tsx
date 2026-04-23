import type { QuestionnaireResponseItem } from '@medplum/fhirtypes';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { OnboardingQuestionnaireStep } from '../onboarding-questionnaire-step';

const mocks = vi.hoisted(() => ({
  next: vi.fn(),
  save: vi.fn(),
  submit: vi.fn(),
  navigation: {
    next: vi.fn(),
    prev: vi.fn(),
    goTo: vi.fn(),
    currentStep: 'about-you',
    validSteps: ['about-you'],
    isLastStep: false,
    isFirstStep: true,
  },
  questionnaireController: {
    questionnaire: {
      resourceType: 'Questionnaire',
      id: 'questionnaire-id',
    },
    response: undefined,
    responseId: undefined,
    isLoading: false,
    save: vi.fn(),
    submit: vi.fn(),
  },
  user: {
    data: { id: 'user-1' },
    isLoading: false,
  },
}));

vi.mock('@tanstack/react-router', () => ({
  useNavigate: vi.fn(),
}));

vi.mock('@/components/seo', () => ({
  Head: () => null,
}));

vi.mock('@/components/ui/questionnaire', () => ({
  QuestionnaireForm: ({
    onSubmit,
  }: {
    onSubmit: (items: QuestionnaireResponseItem[]) => void;
  }) => {
    return <button onClick={() => onSubmit([])}>Submit</button>;
  },
}));

vi.mock('@/features/onboarding/hooks/use-onboarding-navigation', () => ({
  useOnboardingNavigation: () => mocks.navigation,
}));

vi.mock(
  '@/features/questionnaires/hooks/use-questionnaire-response-controller',
  () => ({
    useQuestionnaireResponseController: () => mocks.questionnaireController,
  }),
);

vi.mock('@/lib/auth', () => ({
  useUser: () => mocks.user,
}));

describe('OnboardingQuestionnaireStep', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.navigation.next = mocks.next;
    mocks.navigation.prev = vi.fn();
    mocks.navigation.goTo = vi.fn();
    mocks.navigation.currentStep = 'about-you';
    mocks.navigation.validSteps = ['about-you'];
    mocks.navigation.isLastStep = false;
    mocks.navigation.isFirstStep = true;
    mocks.questionnaireController.questionnaire = {
      resourceType: 'Questionnaire',
      id: 'questionnaire-id',
    };
    mocks.questionnaireController.response = undefined;
    mocks.questionnaireController.responseId = undefined;
    mocks.questionnaireController.isLoading = false;
    mocks.questionnaireController.save = mocks.save;
    mocks.questionnaireController.submit = mocks.submit;
    mocks.user.data = { id: 'user-1' };
    mocks.user.isLoading = false;
    mocks.submit.mockImplementation(
      (
        _items: QuestionnaireResponseItem[],
        options?: {
          onSuccess?: () => void;
        },
      ) => {
        options?.onSuccess?.();
      },
    );
  });

  it('advances to the next step when the questionnaire is not last', async () => {
    const user = userEvent.setup();

    render(
      <OnboardingQuestionnaireStep questionnaireName="onboarding-primer" />,
    );

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(mocks.next).toHaveBeenCalledOnce();
  });

  it('delegates last-step completion to onboarding navigation', async () => {
    mocks.navigation.isLastStep = true;

    const user = userEvent.setup();

    render(
      <OnboardingQuestionnaireStep questionnaireName="onboarding-lifestyle" />,
    );

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(mocks.next).toHaveBeenCalledOnce();
  });
});
