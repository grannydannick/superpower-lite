import {
  TypedValue,
  evalFhirPathTyped,
  getTypedPropertyValue,
} from '@medplum/core';
import {
  QuestionnaireItem,
  QuestionnaireItemEnableWhen,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer,
} from '@medplum/fhirtypes';

import { User } from '@/types/api';

export function isQuestionEnabled(
  item: QuestionnaireItem,
  responseItems: QuestionnaireResponseItem[],
  user?: User,
): boolean {
  if (!item.enableWhen) {
    return true;
  }

  const enableBehavior = item.enableBehavior ?? 'any';

  const result = item.enableWhen.reduce(
    (acc, enableWhen) => {
      // early return if we already have a definitive result
      if (acc.shouldReturn) {
        return acc;
      }

      if (enableWhen.question === 'sex-assigned-at-birth' && user?.gender) {
        if (typeof enableWhen.answerString !== 'string') {
          return acc;
        }
        const userGenderString = user.gender === 'MALE' ? 'Male' : 'Female';
        const expectedString = enableWhen.answerString.trim();

        let matches = false;
        if (enableWhen.operator === '=') {
          matches = userGenderString === expectedString;
        } else if (enableWhen.operator === '!=') {
          matches = userGenderString !== expectedString;
        }

        if (matches) {
          if (enableBehavior === 'any') {
            return { shouldReturn: true, returnValue: true };
          }
        } else {
          if (enableBehavior === 'all') {
            return { shouldReturn: true, returnValue: false };
          }
        }
        return acc;
      }

      const actualAnswers = getByLinkId(
        responseItems,
        enableWhen.question as string,
      );

      if (
        enableWhen.operator === 'exists' &&
        !enableWhen.answerBoolean &&
        !actualAnswers?.length
      ) {
        if (enableBehavior === 'any') {
          return { shouldReturn: true, returnValue: true };
        } else {
          return acc;
        }
      }

      const { anyMatch, allMatch } = checkAnswers(
        enableWhen,
        actualAnswers,
        enableBehavior,
      );

      if (enableBehavior === 'any' && anyMatch) {
        return { shouldReturn: true, returnValue: true };
      }
      if (enableBehavior === 'all' && !allMatch) {
        return { shouldReturn: true, returnValue: false };
      }

      return acc;
    },
    { shouldReturn: false, returnValue: false },
  );

  if (result.shouldReturn) {
    return result.returnValue;
  }

  return enableBehavior !== 'any';
}

function getByLinkId(
  responseItems: QuestionnaireResponseItem[] | undefined,
  linkId: string,
): QuestionnaireResponseItemAnswer[] | undefined {
  if (!responseItems) {
    return undefined;
  }

  for (const response of responseItems) {
    if (response.linkId === linkId) {
      return response.answer;
    }
    if (response.item) {
      const nestedAnswer = getByLinkId(response.item, linkId);
      if (nestedAnswer) {
        return nestedAnswer;
      }
    }
  }

  return undefined;
}

function evaluateMatch(
  actualAnswer: TypedValue | undefined,
  expectedAnswer: TypedValue,
  operator?: string,
): boolean {
  // We handle exists separately since its so different in terms of comparisons than the other mathematical operators
  if (operator === 'exists') {
    // if actualAnswer is not undefined, then exists: true passes
    // if actualAnswer is undefined, then exists: false passes
    return !!actualAnswer === expectedAnswer.value;
  } else if (!actualAnswer) {
    return false;
  } else {
    // Special handling for string equality when using '=' operator
    if (
      operator === '=' &&
      (actualAnswer.type === 'string' || expectedAnswer.type === 'string')
    ) {
      // Direct string comparison for string types
      const actualString = String(actualAnswer.value).trim();
      const expectedString = String(expectedAnswer.value).trim();
      const matches = actualString === expectedString;

      return matches;
    }

    // `=` and `!=` should be treated as the FHIRPath `~` and `!~`
    // All other operators should be unmodified
    const fhirPathOperator =
      operator === '=' || operator === '!='
        ? operator?.replace('=', '~')
        : operator;
    const [{ value }] = evalFhirPathTyped(
      `%actualAnswer ${fhirPathOperator} %expectedAnswer`,
      [actualAnswer],
      {
        '%actualAnswer': actualAnswer,
        '%expectedAnswer': expectedAnswer,
      },
    );
    return value;
  }
}

function checkAnswers(
  enableWhen: QuestionnaireItemEnableWhen,
  answers: QuestionnaireResponseItemAnswer[] | undefined,
  enableBehavior: 'any' | 'all',
): { anyMatch: boolean; allMatch: boolean } {
  const actualAnswers = answers || [];

  const expectedAnswer = getTypedPropertyValue(
    {
      type: 'QuestionnaireItemEnableWhen',
      value: enableWhen,
    },
    'answer[x]',
  ) as TypedValue;

  let anyMatch = false;
  let allMatch = true;

  // If no answers provided for the question, no match
  if (actualAnswers.length === 0) {
    return { anyMatch: false, allMatch: false };
  }

  // Special handling for multi-select questions (when multiple answers can be selected)
  // If the operator is "=" and we're looking for a specific string in a multi-select
  if (
    enableWhen.operator === '=' &&
    expectedAnswer.type === 'string' &&
    actualAnswers.length > 0
  ) {
    const expectedString = String(expectedAnswer.value).trim();

    // Check if any of the actual answers match the expected string
    for (const actualAnswerValue of actualAnswers) {
      const actualAnswer = getTypedPropertyValue(
        {
          type: 'QuestionnaireResponseItemAnswer',
          value: actualAnswerValue,
        },
        'value[x]',
      ) as TypedValue | undefined;

      if (actualAnswer && actualAnswer.type === 'string') {
        const actualString = String(actualAnswer.value).trim();
        if (actualString === expectedString) {
          anyMatch = true;
          break;
        }
      }
    }

    return { anyMatch, allMatch: anyMatch };
  }

  // Standard handling for other types of questions
  for (const actualAnswerValue of actualAnswers) {
    const actualAnswer = getTypedPropertyValue(
      {
        type: 'QuestionnaireResponseItemAnswer',
        value: actualAnswerValue,
      },
      'value[x]',
    ) as TypedValue | undefined; // possibly undefined when question unanswered
    const { operator } = enableWhen;
    const match = evaluateMatch(actualAnswer, expectedAnswer, operator);
    if (match) {
      anyMatch = true;
    } else {
      allMatch = false;
    }

    if (enableBehavior === 'any' && anyMatch) {
      break;
    }
  }

  return { anyMatch, allMatch };
}
