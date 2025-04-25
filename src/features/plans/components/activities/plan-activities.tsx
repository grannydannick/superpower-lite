import { CarePlanActivity } from '@medplum/fhirtypes';
import React from 'react';

import { Separator } from '@/components/ui/separator';
import { Body1, H3, H4 } from '@/components/ui/typography';
import { Disclaimer } from '@/features/plans/components/plan-disclaimer';
import { useProducts } from '@/features/shop/api';

import { useCarePlan } from '../../context/care-plan-context';
import {
  PlanSection,
  PlanSectionHeader,
  PlanSectionTitle,
  PlanSectionContent,
} from '../plan-section';

import { PlanActivity } from './plan-activity';

interface ActivityGroup {
  activities: CarePlanActivity[];
  title: string;
  titleSubtext?: string;
  renderActivity: (activity: CarePlanActivity, index: number) => JSX.Element;
  disclaimer?: JSX.Element;
}

export function PlanActivities() {
  const { plan } = useCarePlan();
  const getProductsQuery = useProducts({});

  if (!plan.activity?.length) return null;

  const {
    serviceActivities,
    productActivities,
    generalActivities,
    productAvailabilityMap,
    hasCancerService,
    hasToxinService,
  } = categorizePlanActivities(plan.activity, getProductsQuery.data?.products);

  const activityGroups: ActivityGroup[] = [
    {
      activities: productActivities,
      title: 'Products / Supplements',
      titleSubtext:
        'These are the following products your clinician has recommended to help you achieve your goals.',
      renderActivity: (activity, index) => {
        const productCode =
          activity.detail?.productCodeableConcept?.coding?.[0]?.code;
        const isAvailable = productCode
          ? productAvailabilityMap.get(productCode)
          : false;

        return (
          <div key={`product-${index}`} className="relative">
            <PlanActivity
              activity={activity}
              className={!isAvailable ? 'opacity-70' : ''}
            />
          </div>
        );
      },
      disclaimer:
        productActivities.length > 0 ? (
          <Disclaimer>
            <p className="text-zinc-500">
              Consult your primary care physician before starting new
              supplement, especially if you have health conditions or take
              medications.
            </p>
          </Disclaimer>
        ) : undefined,
    },
    {
      activities: serviceActivities,
      title: 'Follow-Up Testing',
      titleSubtext:
        'These are the follow-up tests you will be taking to monitor your progress.',
      renderActivity: (activity, index) => (
        <PlanActivity key={`service-${index}`} activity={activity} />
      ),
      disclaimer:
        hasCancerService || hasToxinService ? (
          <div className="mt-4">
            <Disclaimer>
              <p className="text-zinc-500">
                The Grail Galleri test and the Total Toxins test are advanced
                screenings that require further evaluation and approval by one
                of Superpower&apos;s qualified and licensed physicians or nurse
                practitioners.
              </p>
            </Disclaimer>
          </div>
        ) : undefined,
    },
    {
      activities: generalActivities,
      title: 'General Notes',
      titleSubtext:
        'Your clinician has left you some additional notes about your plan:',
      renderActivity: (activity, index) => (
        <div className="space-y-2" key={`general-${index}`}>
          <H4>Note #{index + 1}</H4>
          <PlanActivity activity={activity} />
        </div>
      ),
    },
  ];

  return (
    <PlanSection>
      <PlanSectionHeader>
        <PlanSectionTitle className="flex items-center gap-2">
          Your protocol
        </PlanSectionTitle>
      </PlanSectionHeader>
      <PlanSectionContent className="space-y-8">
        <Body1 className="text-zinc-500">
          Based off your action plan your clinician recommends you do the
          following:
        </Body1>

        {activityGroups.map((group, groupIndex) =>
          group.activities.length ? (
            <React.Fragment key={group.title}>
              {groupIndex > 0 && <Separator />}
              <div className="space-y-3">
                <H3 className="text-zinc-800">{group.title}</H3>
                {group.titleSubtext && (
                  <Body1 className="text-zinc-500">{group.titleSubtext}</Body1>
                )}
                <div className="space-y-1">
                  {group.activities.map((activity, index) => (
                    <div key={`activity-${group.title}-${index}`}>
                      {group.renderActivity(activity, index)}
                    </div>
                  ))}
                </div>
                {group.disclaimer}
              </div>
            </React.Fragment>
          ) : null,
        )}
      </PlanSectionContent>
    </PlanSection>
  );
}

function categorizePlanActivities(
  activities: CarePlanActivity[],
  products?: { id: string }[],
) {
  const serviceActivities: CarePlanActivity[] = [];
  const productActivities: CarePlanActivity[] = [];
  const generalActivities: CarePlanActivity[] = [];
  const productAvailabilityMap = new Map<string, boolean>();

  let hasCancerService = false;
  let hasToxinService = false;

  activities.forEach((activity) => {
    const { detail } = activity;

    if (detail?.productCodeableConcept?.coding?.[0]) {
      const productCode = detail.productCodeableConcept.coding[0].code;
      const product = products?.find((p) => p.id === productCode);

      productActivities.push(activity);

      if (productCode) {
        productAvailabilityMap.set(productCode, !!product);
      }
    } else if (detail?.code?.coding?.[0]) {
      serviceActivities.push(activity);

      const serviceCode = detail.code.coding[0].code;
      if (serviceCode === 'grail-galleri-multi-cancer-test') {
        hasCancerService = true;
      }
      if (serviceCode === 'total-toxin-test') {
        hasToxinService = true;
      }
    } else {
      generalActivities.push(activity);
    }
  });

  return {
    serviceActivities,
    productActivities,
    generalActivities,
    productAvailabilityMap,
    hasCancerService,
    hasToxinService,
  };
}
