import { QuestionnaireResponseItem } from '@medplum/fhirtypes';

export const pruneResponseItems = (
  items: QuestionnaireResponseItem[] = [],
): QuestionnaireResponseItem[] => {
  return items.reduce<QuestionnaireResponseItem[]>((acc, item) => {
    const prunedNestedItems = pruneResponseItems(item.item ?? []);
    const hasAnswer = Boolean(item.answer && item.answer.length > 0);

    if (hasAnswer || prunedNestedItems.length > 0) {
      acc.push({
        ...item,
        answer: hasAnswer ? item.answer : undefined,
        item: prunedNestedItems.length > 0 ? prunedNestedItems : undefined,
      });
    }

    return acc;
  }, []);
};
