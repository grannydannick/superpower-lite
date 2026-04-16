import { useQuery, useSuspenseQuery } from '@tanstack/react-query';

import { $api } from '@/orpc/client';
import type { operations } from '@/orpc/types.generated';

type GetOnboardingResponse =
  operations['onboarding.getOnboarding']['responses'][200]['content']['application/json'];

type OnboardingUserInfo = GetOnboardingResponse['userInfo'];
type OnboardingUserGender = OnboardingUserInfo['userGender'];
type OnboardingQuestionnaire = GetOnboardingResponse['questionnaires'][number];
type OnboardingQuestionnaireIdentifier = OnboardingQuestionnaire['identifier'];
type OnboardingCredit = GetOnboardingResponse['credits'][number];

export type {
  GetOnboardingResponse,
  OnboardingCredit,
  OnboardingQuestionnaireIdentifier,
  OnboardingQuestionnaire,
  OnboardingUserGender,
  OnboardingUserInfo,
};

export function useOnboarding(options?: { enabled?: boolean }) {
  return useQuery({
    ...getOnboardingQueryOptions(),
    enabled: options?.enabled ?? true,
  });
}

export const getOnboardingQueryOptions = () =>
  $api.queryOptions('get', '/rpc/onboarding');

export function useSuspenseOnboarding() {
  return useSuspenseQuery(getOnboardingQueryOptions());
}
