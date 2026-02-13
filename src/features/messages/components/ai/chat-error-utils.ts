export type ChatErrorKind = 'validation' | 'public' | 'generic';

type ClassifyChatErrorParams = {
  errorName: string;
  errorMessage: string;
  publicErrors: readonly string[];
};

export const classifyChatError = ({
  errorName,
  errorMessage,
  publicErrors,
}: ClassifyChatErrorParams): ChatErrorKind => {
  const isValidationError =
    errorName === 'AI_TypeValidationError' ||
    errorMessage.includes('Type validation failed') ||
    (errorMessage.includes('finish') && errorMessage.includes('finishReason'));

  if (isValidationError) {
    return 'validation';
  }

  if (publicErrors.includes(errorMessage)) {
    return 'public';
  }

  return 'generic';
};
