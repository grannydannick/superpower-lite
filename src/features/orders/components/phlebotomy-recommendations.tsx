import { IconList } from '@/components/shared/icon-list';
import { Body1 } from '@/components/ui/typography';
import { useUser } from '@/lib/auth';

import { FEMALE_RECOMMENDATIONS } from '../const/female-recommendations';
import { TEST_STEPS } from '../const/test-steps';
import { getNextRecommendedDay } from '../utils/get-next-recommended-day';

export const PhlebotomyRecommendations = () => {
  const { data: user } = useUser();

  return (
    <>
      <Body1 className="text-secondary">
        Book your test on or after {getNextRecommendedDay()} for most accurate
        results.
      </Body1>
      {user?.gender?.toLowerCase() === 'female' && (
        <ul className="list-outside list-disc space-y-3 pl-5 marker:text-zinc-300 md:mb-0 md:mt-4">
          {FEMALE_RECOMMENDATIONS.map((recommendation, index) => (
            <li key={index}>
              <Body1 className="text-secondary">{recommendation}</Body1>
            </li>
          ))}
        </ul>
      )}
      <IconList items={TEST_STEPS} className="mt-8" />
    </>
  );
};
