import { Goal } from '@medplum/fhirtypes';
import { usePostHog } from 'posthog-js/react';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Body1 } from '@/components/ui/typography';
import { getRxPricing } from '@/const/rx-pricing';
import { useProducts } from '@/features/shop/api';
import { cn } from '@/lib/utils';

import { CARE_PLAN_ACTIVITY_TYPE_EXTENSION } from '../../api';
import { useCarePlan } from '../../context/care-plan-context';
import { ActivityCard } from '../activities/activity-card';
import { ProductCard } from '../activities/product-card';

type PlanGoalProductsProps = {
  goal: Goal;
};

export function PlanGoalProducts({ goal }: PlanGoalProductsProps) {
  const { plan } = useCarePlan();
  const activities = plan?.activity ?? [];
  const posthog = usePostHog();
  const { data: productsData } = useProducts({});

  // Feature flag to control prescription recommendations visibility
  const isPrescriptionRecommendationsEnabled = posthog?.isFeatureEnabled(
    'aiap-rx-experimental-recommendations',
  );

  const goalId = goal.id;

  const linkedProductActivities = activities.filter((activity) => {
    const refs = activity.detail?.goal?.map((g) => g.reference) ?? [];
    const isLinked = goalId
      ? refs.some((ref) => ref === `Goal/${goalId}`)
      : false;

    // Only show activities that reference a product/prescription
    const hasProduct = Boolean(
      activity.detail?.productCodeableConcept?.coding?.[0],
    );

    if (!isLinked || !hasProduct) return false;

    // Respect feature flag: hide prescriptions unless enabled
    const activityType = activity.detail?.extension?.find(
      (ext) => ext.url === CARE_PLAN_ACTIVITY_TYPE_EXTENSION,
    )?.valueString;

    if (
      activityType === 'rx-experimental' &&
      !isPrescriptionRecommendationsEnabled
    ) {
      return false;
    }

    return true;
  });

  if (!linkedProductActivities.length) return null;

  return (
    <div className="space-y-2">
      <Body1>
        <strong>
          Recommended Product
          {linkedProductActivities.length > 1 ? 's' : ''}:
        </strong>
      </Body1>
      <div
        className={cn(
          linkedProductActivities.length > 1 &&
            'space-y-2 rounded-[22px] border border-zinc-200 bg-zinc-100 p-2',
        )}
      >
        {linkedProductActivities.map((activity, index) => {
          const productCoding =
            activity.detail?.productCodeableConcept?.coding?.[0];
          const activityType = activity.detail?.extension?.find(
            (ext) => ext.url === CARE_PLAN_ACTIVITY_TYPE_EXTENSION,
          )?.valueString;

          if (!productCoding) return null;

          if (activityType === 'rx-experimental') {
            if (!isPrescriptionRecommendationsEnabled) return null;
            const rxName = productCoding.display || 'Prescription';
            const rxCode = productCoding.code;
            const rxPricing = rxCode ? getRxPricing(rxCode) : undefined;
            const rxLink = rxPricing?.slug
              ? `https://clinic.superpower.com/products/${rxPricing.slug}`
              : undefined;
            const rxImage = rxCode ? `/rx/${rxCode}.webp` : undefined;

            return (
              <ActivityCard
                key={`goal-${goalId}-rx-${index}`}
                name={rxName}
                image={rxImage}
                link={rxLink}
                description={
                  rxPricing ? (
                    <Body1 className="italic text-zinc-500">
                      Starting at ${rxPricing.price}
                    </Body1>
                  ) : undefined
                }
                actionBtn={
                  rxLink ? (
                    <Button size="medium" asChild>
                      <a
                        href={rxLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Get Started
                      </a>
                    </Button>
                  ) : undefined
                }
              />
            );
          }

          const product = productsData?.products?.find(
            (p) => p.id === productCoding.code,
          );
          const productName = productCoding.display || 'Product';

          return (
            <ProductCard
              key={`goal-${goalId}-product-${index}`}
              productName={productName}
              product={product}
            />
          );
        })}
      </div>
    </div>
  );
}
