import { Annotation, Goal } from '@medplum/fhirtypes';

import { extractCitationsFromExtensions } from '../../utils/extract-citations';
import { PlanMarkdown } from '../plan-markdown';

import { PlanGoalObservation } from './plan-goal-observation';
import { PlanGoalProducts } from './plan-goal-products';

export type PlanGoalProps = {
  goal: Goal;
  index: number;
};

function getAnnotationType(note: Annotation): string {
  return (
    note.extension?.find(
      (e) =>
        e.url ===
        'https://superpower.com/fhir/StructureDefinition/goal-annotation-type',
    )?.valueString || 'intro'
  );
}

export function PlanGoal({ goal }: PlanGoalProps) {
  const goalObservations =
    (goal.addresses
      ?.map((a) => a.reference?.split('/')[1])
      .filter((r) => r !== undefined) as string[]) ?? [];

  const introText =
    goal.note
      ?.filter((n) => getAnnotationType(n) === 'intro')
      .map((n) => n.text)
      .join('\n\n') || '';

  const noteText =
    goal.note
      ?.filter((n) => getAnnotationType(n) !== 'intro')
      .map((n) => n.text)
      .join('\n\n') || '';

  const citations = extractCitationsFromExtensions(goal.extension);

  return (
    <div className="space-y-6">
      {introText && (
        <div>
          <PlanMarkdown content={introText} citations={citations} />
        </div>
      )}

      {goalObservations.length > 0 && (
        <div className="space-y-2">
          <div className="space-y-2">
            {goalObservations.map((id) => (
              <PlanGoalObservation id={id} key={id} />
            ))}
          </div>
        </div>
      )}

      {noteText && (
        <div>
          <PlanMarkdown content={noteText} citations={citations} />
        </div>
      )}

      <PlanGoalProducts goal={goal} />
    </div>
  );
}
