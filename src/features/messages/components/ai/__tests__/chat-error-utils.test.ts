import { describe, expect, it } from 'vitest';

import { classifyChatError } from '../chat-error-utils';

const publicErrors = [
  'Too many requests, please try again later.',
  'This chat has ended. Please start a new chat.',
] as const;

describe('classifyChatError', () => {
  it('classifies SDK validation errors', () => {
    expect(
      classifyChatError({
        errorName: 'AI_TypeValidationError',
        errorMessage: 'Type validation failed',
        publicErrors,
      }),
    ).toBe('validation');
  });

  it('classifies public API errors', () => {
    expect(
      classifyChatError({
        errorName: 'Error',
        errorMessage: 'Too many requests, please try again later.',
        publicErrors,
      }),
    ).toBe('public');
  });

  it('classifies unknown errors as generic', () => {
    expect(
      classifyChatError({
        errorName: 'Error',
        errorMessage: 'Network request failed.',
        publicErrors,
      }),
    ).toBe('generic');
  });
});
