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
      <div className="space-y-8">
        {goals.length > 0 && (
          <Body1>
            Monitored issues highlight potential health concerns based on your
            test results to focus on. Think of it as a starting points for your
            health roadmap—pinpointing areas for proactive care.
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
        {goals.length > 0 && goals[0].resource && (
          <div className="space-y-4">
            <H2>Your top health priority</H2>
            <Accordion
              type="multiple"
              defaultValue={[`goal-${goals[0].resource.id}`]}
            >
              <AccordionItem
                key={goals[0].resource.id}
                value={`goal-${goals[0].resource.id}`}
              >
                <AccordionTrigger className="group flex flex-1 items-center justify-between py-4 font-medium text-zinc-900 transition-colors hover:text-zinc-600 [&[data-state=open]>svg]:rotate-180">
                  <div className="flex w-full flex-col items-start justify-between gap-1.5 pr-2 md:flex-row-reverse md:items-center">
                    <div className="ml-5 shrink-0">
                      <PlanGoalPriority
                        code={goals[0].resource.priority?.coding?.[0]?.code}
                      />
                    </div>
                    <div className="flex items-start gap-2 pr-12 text-left">
                      <H4 className="transition-colors group-hover:text-zinc-600">
                        1.
                      </H4>
                      <H4
                        id="section-heading"
                        className="font-semibold transition-colors group-hover:text-zinc-600"
                      >
                        {goals[0].resource.description.text ||
                          goals[0].resource.description.coding?.[0].display ||
                          `Issue #1`}
                      </H4>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <PlanGoal goal={goals[0].resource} index={1} />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )}

        {goals.length > 1 && (
          <div className="space-y-4">
            <H2>Additional Issues to monitor</H2>
            <Accordion type="multiple">
              {goals.slice(1).map((goal, idx) =>
                goal.resource ? (
                  <AccordionItem
                    key={goal.resource.id}
                    value={`goal-${goal.resource.id}`}
                  >
                    <AccordionTrigger className="group flex flex-1 items-center justify-between py-4 font-medium text-zinc-900 transition-colors hover:text-zinc-600 [&[data-state=open]>svg]:rotate-180">
                      <div className="flex w-full flex-col items-start justify-between gap-1.5 pr-2 md:flex-row-reverse md:items-center">
                        <div className="ml-5 shrink-0">
                          <PlanGoalPriority
                            code={goal.resource.priority?.coding?.[0]?.code}
                          />
                        </div>
                        <div className="flex items-start gap-2 pr-12 text-left">
                          <H4 className="transition-colors group-hover:text-zinc-600">
                            {idx + 2}.
                          </H4>
                          <H4 className="font-semibold transition-colors group-hover:text-zinc-600">
                            {goal.resource.description.text ||
                              goal.resource.description.coding?.[0].display ||
                              `Issue #${idx + 2}`}
                          </H4>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                      <PlanGoal goal={goal.resource} index={idx + 2} />
                    </AccordionContent>
                  </AccordionItem>
                ) : null,
              )}
            </Accordion>
          </div>
        )}
      </div>
    </section>
  );
};
