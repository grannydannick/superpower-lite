import { Questionnaire, QuestionnaireResponse } from '@medplum/fhirtypes';
import { vi } from 'vitest';

import { rtlRender, screen, userEvent, waitFor } from '@/testing/test-utils';
import { User } from '@/types/api';

import { QuestionnaireForm } from '../questionnaire-form';

vi.mock('@/hooks/use-identity-verification', () => ({
  useIdentityVerification: () => ({
    needsVerification: false,
    isVerified: true,
    isExpired: false,
    verificationMutation: { mutate: vi.fn() },
  }),
  useIdentityVerificationStatus: () => ({
    needsVerification: false,
    isVerified: true,
    isExpired: false,
  }),
}));
vi.mock('../consent-payment-summary', () => ({
  ConsentPaymentSummary: () => null,
}));
vi.mock('@/features/settings/hooks', () => ({
  usePaymentMethodSelection: () => ({
    activePaymentMethod: { externalPaymentMethodId: 'pm_test_123' },
    isSelectingPaymentMethod: false,
  }),
}));

const mockUser: User = {
  id: 'test-user-id',
  username: 'johnpork',
  firstName: 'john',
  lastName: 'pork',
  createdAt: '2023-01-01T00:00:00Z',
  email: 'test@example.com',
  phone: '+1234567890',
  dateOfBirth: '1990-01-01',
  gender: 'MALE',
  subscribed: false,
  admin: false,
  authMethod: 'password',
  address: [],
  role: ['MEMBER'],
};

test('submits when last optional question is empty', async () => {
  const questionnaire: Questionnaire = {
    resourceType: 'Questionnaire',
    status: 'active',
    id: 'test-questionnaire',
    item: [
      {
        linkId: 'q1',
        text: 'Optional question',
        type: 'string',
        required: false,
      },
    ],
  };

  const response: QuestionnaireResponse = {
    resourceType: 'QuestionnaireResponse',
    status: 'in-progress',
  };

  const handleSave = vi.fn();
  const handleSubmit = vi.fn();

  rtlRender(
    <QuestionnaireForm
      questionnaire={questionnaire}
      response={response}
      user={mockUser}
      onSave={handleSave}
      onSubmit={handleSubmit}
    />,
  );

  await userEvent.click(screen.getByRole('button', { name: /submit/i }), {
    pointerEventsCheck: 0,
  });

  await waitFor(() => expect(handleSubmit).toHaveBeenCalledWith([]));
});

test('submits when consent-payment confirm is clicked', async () => {
  const questionnaire: Questionnaire = {
    resourceType: 'Questionnaire',
    status: 'active',
    id: 'test-questionnaire',
    item: [
      {
        linkId: 'consent-payment.payment',
        text: 'Confirm your purchase',
        type: 'choice',
        required: true,
        answerOption: [{ valueString: 'Confirm' }],
      },
    ],
  };

  const response: QuestionnaireResponse = {
    resourceType: 'QuestionnaireResponse',
    status: 'in-progress',
  };

  const handleSubmit = vi.fn();

  rtlRender(
    <QuestionnaireForm
      questionnaire={questionnaire}
      response={response}
      user={mockUser}
      onSave={vi.fn()}
      onSubmit={handleSubmit}
    />,
  );

  await userEvent.click(screen.getByRole('button', { name: 'Confirm' }), {
    pointerEventsCheck: 0,
  });

  await waitFor(() => expect(handleSubmit).toHaveBeenCalled());

  const submittedItems = handleSubmit.mock.calls[0][0];
  expect(submittedItems).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        linkId: 'consent-payment.payment',
        answer: [{ valueString: 'Confirm' }],
      }),
    ]),
  );
});

test('uses entryFormat extension as placeholder for string inputs', () => {
  const questionnaire: Questionnaire = {
    resourceType: 'Questionnaire',
    status: 'active',
    id: 'test-questionnaire',
    item: [
      {
        linkId: 'q1',
        text: 'Optional question',
        type: 'string',
        required: false,
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/entryFormat',
            valueString: 'Add your answer...',
          },
        ],
      },
    ],
  };

  const response: QuestionnaireResponse = {
    resourceType: 'QuestionnaireResponse',
    status: 'in-progress',
  };

  rtlRender(
    <QuestionnaireForm
      questionnaire={questionnaire}
      response={response}
      user={mockUser}
      onSave={vi.fn()}
      onSubmit={vi.fn()}
    />,
  );

  expect(screen.getByPlaceholderText('Add your answer...')).toBeInTheDocument();
});

test('uses entryFormat extension as placeholder for text inputs', () => {
  const questionnaire: Questionnaire = {
    resourceType: 'Questionnaire',
    status: 'active',
    id: 'test-questionnaire',
    item: [
      {
        linkId: 'q1',
        text: 'Optional question',
        type: 'text',
        required: false,
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/entryFormat',
            valueString: 'Add your answer...',
          },
        ],
      },
    ],
  };

  const response: QuestionnaireResponse = {
    resourceType: 'QuestionnaireResponse',
    status: 'in-progress',
  };

  rtlRender(
    <QuestionnaireForm
      questionnaire={questionnaire}
      response={response}
      user={mockUser}
      onSave={vi.fn()}
      onSubmit={vi.fn()}
    />,
  );

  expect(screen.getByPlaceholderText('Add your answer...')).toBeInTheDocument();
});
