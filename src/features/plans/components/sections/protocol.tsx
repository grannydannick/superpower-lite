import { CarePlanActivity } from '@medplum/fhirtypes';
import { Info, LucideIcon, Pencil, Pill, TestTube } from 'lucide-react';
import React from 'react';

import { IconHighlight } from '@/components/shared/icon-highlight';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Body1, Body2, H2, H4 } from '@/components/ui/typography';
import { useProducts } from '@/features/shop/api';

import { useCarePlan } from '../../context/care-plan-context';
import { useSection } from '../../hooks/use-section';
import { extractCitationsFromExtensions } from '../../utils/extract-citations';
import { PlanActivity } from '../activities/plan-activity';
import { Disclaimer } from '../plan-disclaimer';
import { PlanMarkdown } from '../plan-markdown';
import { SectionTitle } from '../section-title';

interface ActivityGroup {
  activities: CarePlanActivity[];
  icon: LucideIcon;
  title: string;
  titleSubtext?: string;
  renderActivity: (activity: CarePlanActivity, index: number) => JSX.Element;
  disclaimer?: JSX.Element;
}

const AboutDisclaimer = () => {
  return (
    <div className="mb-4 space-y-2 rounded-2xl border border-zinc-200 p-4">
      <div className="flex items-center gap-2">
        <Info className="size-4 text-vermillion-900" />
        <Body2 className="mt-px leading-none text-vermillion-900">
          About this action plan
        </Body2>
      </div>
      <Body1 className="text-zinc-400">
        Superpower isn’t a replacement for your primary care provider. Questions
        or concerns? Review these results with your doctor.
      </Body1>
    </div>
  );
};

export const ProtocolSection = () => {
  const { plan } = useCarePlan();
  const { title, order, total } = useSection('protocol');
  const getProductsQuery = useProducts({});

  const activities = plan?.activity ?? [];

  const {
    serviceActivities,
    productActivities,
    generalActivities,
    productAvailabilityMap,
    hasCancerService,
    hasToxinService,
  } = categorizePlanActivities(activities, getProductsQuery.data?.products);

  const planCitations = extractCitationsFromExtensions(plan?.extension);

  const activityGroups: ActivityGroup[] = [
    {
      activities: productActivities,
      icon: Pill,
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
            <p>
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
      icon: TestTube,
      titleSubtext:
        'These are the follow-up tests you will be taking to monitor your progress.',
      renderActivity: (activity, index) => (
        <PlanActivity key={`service-${index}`} activity={activity} />
      ),
      disclaimer:
        hasCancerService || hasToxinService ? (
          <div className="mt-4">
            <Disclaimer>
              <p>
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
      icon: Pencil,
      titleSubtext:
        'Your clinician has left you some additional notes about your plan:',
      renderActivity: (activity, index) => (
        <div className="space-y-2" key={`general-${index}`}>
          <H4 className="text-lg">Note #{index + 1}</H4>
          <PlanActivity activity={activity} />
        </div>
      ),
    },
  ];

  const firstGroupWithActivities = activityGroups.find(
    (group) => group.activities.length > 0,
  );

  return (
    <section id="protocol" className="space-y-4">
      <SectionTitle
        style={{
          backgroundImage: 'url(/action-plan/sections/red-background.webp)',
        }}
      >
        <Body1 className="text-white">
          {order} of {total}
        </Body1>
        <H2 id="section-title" className="text-white">
          {title}
        </H2>
      </SectionTitle>
      <div className="space-y-8">
        {activities.length > 0 && (
          <Body1>
            Based off your action plan your clinician recommends you do the
            following:
          </Body1>
        )}
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-zinc-200 py-8">
            <H4 className="text-center">No protocol recommended</H4>
            <Body1 className="max-w-sm text-balance text-center text-secondary">
              Your longevity advisor has no protocol recommendations for you.
            </Body1>
          </div>
        ) : (
          <Accordion
            type="multiple"
            defaultValue={
              firstGroupWithActivities
                ? [`group-${firstGroupWithActivities.title}`]
                : []
            }
          >
            {activityGroups.map((group) =>
              group.activities.length ? (
                <AccordionItem key={group.title} value={`group-${group.title}`}>
                  <AccordionTrigger className="group flex flex-1 items-center justify-between py-4 font-medium text-zinc-900 transition-colors hover:text-zinc-600 [&[data-state=open]>svg]:rotate-180">
                    <div className="flex items-center gap-3">
                      <IconHighlight
                        icon={group.icon}
                        className="flex size-8 items-center justify-center p-1.5"
                      />
                      <H4
                        id="section-heading"
                        className="m-0 text-zinc-800 transition-colors group-hover:text-zinc-600"
                      >
                        {group.title}
                      </H4>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-3">
                      {group.titleSubtext && (
                        <PlanMarkdown
                          content={group.titleSubtext}
                          citations={planCitations}
                        />
                      )}
                      <div className="space-y-6">
                        {group.activities.map((activity, index) => (
                          <div key={`activity-${group.title}-${index}`}>
                            {group.renderActivity(activity, index)}
                          </div>
                        ))}
                      </div>
                      {group.disclaimer}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ) : null,
            )}
          </Accordion>
        )}
      </div>
      <AboutDisclaimer />
    </section>
  );
};

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
