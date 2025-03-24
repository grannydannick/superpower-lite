import { Annotation } from '@medplum/fhirtypes';

export type PlanAnnotationProps = {
  annotation: Annotation;
};
export function PlanAnnotation({ annotation }: PlanAnnotationProps) {
  return <div className="rounded-md bg-gray-50 p-2">{annotation.text}</div>;
}
