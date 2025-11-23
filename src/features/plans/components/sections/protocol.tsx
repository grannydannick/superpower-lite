import { CarePlanActivity } from '@medplum/fhirtypes';
import {
  Apple,
  Info,
  LucideIcon,
  Pill,
  Pencil,
  PersonStanding,
  TestTube,
  Stethoscope,
} from 'lucide-react';
import React from 'react';

import { IconHighlight } from '@/components/shared/icon-highlight';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Body1, Body2, H2, H4 } from '@/components/ui/typography';
import { useProducts } from '@/features/supplements/api';
import { useAnalytics } from '@/hooks/use-analytics';

import { CARE_PLAN_ACTIVITY_TYPE_EXTENSION } from '../../const/extension-types';
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
        Written by Superpower’s custom proprietary AI, built from the minds of
        the best in medicine. Superpower isn’t a replacement for your primary
        care provider. If you have questions or concerns, please review these
        results with your doctor.
      </Body1>
    </div>
  );
};

export const ProtocolSection = () => {
  const { plan } = useCarePlan();
  const { title, order, total } = useSection('protocol');
  const getProductsQuery = useProducts({});
  const { track } = useAnalytics();
  const previousValueRef = React.useRef<string[]>([]);

  const activities = plan?.activity ?? [];

  const {
    serviceActivities,
    productActivities,
    lifestyleActivities,
    nutritionActivities,
    prescriptionActivities,
    generalActivities,
    hasCancerService,
    hasToxinService,
    productAvailabilityMap,
  } = categorizePlanActivities(activities, getProductsQuery.data?.products);

  const planCitations = extractCitationsFromExtensions(plan?.extension);

  const handleAccordionValueChange = (value: string[]) => {
    // Find newly opened accordions by comparing with previous value
    const newlyOpened = value.filter(
      (item) => !previousValueRef.current.includes(item),
    );

    // Track when Products/Supplements accordion is newly opened
    if (newlyOpened.includes('group-Products / Supplements')) {
      track('aiap_opened_products_accordion', {
        accordion_type: 'products_supplements',
        section: 'protocol',
      });
    }

    // Track when Diagnostic Tests accordion is newly opened
    if (newlyOpened.includes('group-Diagnostic Tests')) {
      track('aiap_opened_tests_accordion', {
        accordion_type: 'diagnostic_tests',
        section: 'protocol',
      });
    }

    // Track when Prescription Treatments accordion is newly opened
    if (newlyOpened.includes('group-Prescription Treatments')) {
      track('aiap_opened_prescriptions_accordion', {
        accordion_type: 'prescriptions',
        section: 'protocol',
      });
    }

    // Update the ref with the new value for next comparison
    previousValueRef.current = value;
  };

  const activityGroups: ActivityGroup[] = [
    {
      activities: prescriptionActivities,
      icon: Stethoscope,
      title: 'Prescription Treatments',
      renderActivity: (activity: CarePlanActivity, index: number) => (
        <PlanActivity key={`prescription-${index}`} activity={activity} />
      ),
      disclaimer: undefined,
    },
    {
      activities: productActivities,
      icon: Pill,
      title: 'Products / Supplements',
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
      title: 'Diagnostic Tests',
      icon: TestTube,
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
      activities: lifestyleActivities,
      icon: PersonStanding,
      title: 'Lifestyle',
      renderActivity: (activity, index) => (
        <PlanActivity key={`lifestyle-${index}`} activity={activity} />
      ),
    },
    {
      activities: nutritionActivities,
      icon: Apple,
      title: 'Nutrition',
      renderActivity: (activity, index) => (
        <PlanActivity key={`nutrition-${index}`} activity={activity} />
      ),
    },
    {
      activities: generalActivities,
      title: 'General Notes',
      icon: Pencil,
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
            Superpower has designed a personal protocol to help target your
            health goals and address your monitored issues. By following this
            protocol and re-testing your blood panel, you should see great
            progress.
          </Body1>
        )}
        {activities.length === 0 ? (
          // This should NEVER happen
          <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-zinc-200 py-8">
            <H4 className="text-center">No protocol recommended</H4>
            <Body1 className="max-w-sm text-balance text-center text-secondary">
              We have no protocol recommendations for you.
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
            onValueChange={handleAccordionValueChange}
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
  const lifestyleActivities: CarePlanActivity[] = [];
  const nutritionActivities: CarePlanActivity[] = [];
  const prescriptionActivities: CarePlanActivity[] = [];
  const generalActivities: CarePlanActivity[] = [];
  const productAvailabilityMap = new Map<string, boolean>();

  let hasCancerService = false;
  let hasToxinService = false;

  activities.forEach((activity) => {
    const { detail } = activity;

    // Check for activity type extension
    const activityTypeExtension = detail?.extension?.find(
      (ext) => ext.url === CARE_PLAN_ACTIVITY_TYPE_EXTENSION,
    );
    const activityType = activityTypeExtension?.valueString;

    if (
      detail?.productCodeableConcept?.coding?.[0] &&
      activityType !== 'rx-experimental'
    ) {
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
      if (activityType === 'lifestyle') {
        lifestyleActivities.push(activity);
      } else if (activityType === 'nutrition-experimental') {
        nutritionActivities.push(activity);
      } else if (activityType === 'rx-experimental') {
        prescriptionActivities.push(activity);
      } else {
        generalActivities.push(activity);
      }
    }
  });

  return {
    serviceActivities,
    productActivities,
    lifestyleActivities,
    nutritionActivities,
    prescriptionActivities,
    generalActivities,
    productAvailabilityMap,
    hasCancerService,
    hasToxinService,
  };
}
