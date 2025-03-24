import { CarePlan } from '@medplum/fhirtypes';
import { MessageCircle } from 'lucide-react';

import {
  PlanSection,
  PlanSectionHeader,
  PlanSectionTitle,
  PlanSectionContent,
} from '@/features/plans/components/plan-section';

import { PlanAnnotation } from './plan-annotation';

export function PlanAnnotations({ carePlan }: { carePlan: CarePlan }) {
  if (!carePlan.note || carePlan.note.length === 0) return;

  return (
    <PlanSection>
      <PlanSectionHeader>
        <PlanSectionTitle className="flex items-center gap-2">
          <MessageCircle className="size-5" />
          Notes
        </PlanSectionTitle>
      </PlanSectionHeader>
      <PlanSectionContent>
        <div className="space-y-2">
          {carePlan.note.map((annotation, index) => (
            <PlanAnnotation annotation={annotation} key={index} />
          ))}
        </div>
      </PlanSectionContent>
    </PlanSection>
  );
}
