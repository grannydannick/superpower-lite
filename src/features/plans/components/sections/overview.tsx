import { Body1, H2 } from '@/components/ui/typography';

import { useCarePlan } from '../../context/care-plan-context';
import { useSection } from '../../hooks/use-section';
import { extractCitationsFromExtensions } from '../../utils/extract-citations';
import { PlanMarkdown } from '../plan-markdown';
import { SectionTitle } from '../section-title';

export const Overview = () => {
  const { plan } = useCarePlan();
  const { title, order, total } = useSection('overview');

  const content =
    plan.description ||
    'Your action plan has been updated to reflect the info in your questionnaire and biomarkers, including lifestyle, supplement, and testing recommendations.';

  const citations = extractCitationsFromExtensions(plan.extension);

  return (
    <section id="overview" className="relative space-y-4">
      <SectionTitle
        style={{
          backgroundImage: 'url(/action-plan/sections/golden-background.webp)',
        }}
      >
        <Body1 className="text-white">
          {order} of {total}
        </Body1>
        <H2 className="text-white" id="section-title">
          {title}
        </H2>
      </SectionTitle>
      <PlanMarkdown content={content} citations={citations} boldVermillion />
    </section>
  );
};
