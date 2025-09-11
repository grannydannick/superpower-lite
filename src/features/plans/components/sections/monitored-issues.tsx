import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Body1, H2, H4 } from '@/components/ui/typography';

import { useCarePlan } from '../../context/care-plan-context';
import { useSection } from '../../hooks/use-section';
import { PlanGoal } from '../goals/plan-goal';
import { PlanGoalPriority } from '../goals/plan-goal-priority';
import { SectionTitle } from '../section-title';

export const MonitoredIssues = () => {
  const { plan } = useCarePlan();
  const { title, order, total } = useSection('monitored-issues');
  const goals = plan.goal ?? [];

  return (
    <section id="monitored-issues" className="space-y-4">
      <SectionTitle
        style={{
          backgroundImage: 'url(/action-plan/sections/grey-background.webp)',
        }}
      >
        <Body1 className="text-white">
          {order} of {total}
        </Body1>
        <H2 className="text-white" id="section-title">
          {title}
        </H2>
      </SectionTitle>
      <div className="space-y-8">
        {goals.length > 0 && (
          <Body1>
            Monitored issues highlight potential health concerns based on your
            test results to focus on. Think of it as a starting points for your
            health roadmap—pinpointing areas for proactive care.
            <br /> <br />
            We detected {goals.length} monitored issues you should be aware of.
          </Body1>
        )}
        {goals.length === 0 && (
          // This should NEVER happen
          <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-zinc-200 py-8">
            <H4 className="text-center">No monitored issues</H4>
            <Body1 className="max-w-sm text-balance text-center text-secondary">
              We have no recommendations for you.
            </Body1>
          </div>
        )}
        <Accordion
          type="multiple"
          defaultValue={
            goals.length > 0 && goals[0].resource
              ? [`goal-${goals[0].resource.id}`]
              : []
          }
        >
          {goals.map((goal, index) =>
            goal.resource ? (
              <AccordionItem
                key={goal.resource.id}
                value={`goal-${goal.resource.id}`}
              >
                <AccordionTrigger className="group flex flex-1 items-center justify-between py-4 font-medium text-zinc-900 transition-colors hover:text-zinc-600 [&[data-state=open]>svg]:rotate-180">
                  <div className="flex w-full items-center justify-between gap-1 pr-2">
                    <div className="flex items-start gap-2 pr-12 text-left">
                      <H4 className="transition-colors group-hover:text-zinc-600">
                        {index + 1}.
                      </H4>
                      <H4
                        id="section-heading"
                        className="line-clamp-3 font-semibold transition-colors group-hover:text-zinc-600"
                      >
                        {goal.resource.description.text ||
                          goal.resource.description.coding?.[0].display ||
                          `Issue #${index + 1}`}
                      </H4>
                    </div>
                    <PlanGoalPriority
                      code={goal.resource.priority?.coding?.[0].code}
                    />
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <PlanGoal goal={goal.resource} index={index + 1} />
                </AccordionContent>
              </AccordionItem>
            ) : null,
          )}
        </Accordion>
      </div>
    </section>
  );
};
