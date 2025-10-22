import { IconList } from '@/components/shared/icon-list';
import { Body1, H3 } from '@/components/ui/typography';
import { HealthcareServiceFooter } from '@/features/orders/components/healthcare-service-footer';
import { HEALTHCARE_SERVICE_DIALOG_CONTAINER_STYLE } from '@/features/orders/const/config';
import { FEMALE_RECOMMENDATIONS } from '@/features/orders/const/female-recommendations';
import { TEST_STEPS } from '@/features/orders/const/test-steps';
import { getNextRecommendedDay } from '@/features/orders/utils/get-next-recommended-day';
import { useUser } from '@/lib/auth';
import { cn } from '@/lib/utils';

export const BloodDrawRecommendations = () => {
  return (
    <>
      <div
        className={cn('space-y-8', HEALTHCARE_SERVICE_DIALOG_CONTAINER_STYLE)}
      >
        <H3>Recommendations for testing</H3>
        <Recommendations />
      </div>
      <HealthcareServiceFooter nextBtnDisabled={!location} />
    </>
  );
};

const Recommendations = () => {
  const { data: user } = useUser();

  return (
    <>
      <Body1 className="text-secondary">
        Book your test on or after {getNextRecommendedDay()} for the most
        accurate results.
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
