import { TriangleAlert } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { QuestionnaireFormRepeatedGroup } from '@/features/questionnaires/components/questionnaire-group';
import { QuestionnaireFormRepeatableItem } from '@/features/questionnaires/components/questionnaire-repeatable-item';
import { useQuestionnaireStore } from '@/features/questionnaires/stores/questionnaire-store';
import { QuestionnaireItemType } from '@/features/questionnaires/utils/questionnaire';

export const QuestionnaireFormPageSequence = () => {
  const { questionnaire, response, activeStep, getNumberOfPages, setItems } =
    useQuestionnaireStore((s) => s);
  const items = questionnaire.item ?? [];
  const renderPages = getNumberOfPages() > 1;

  const form = items.map((item) => {
    const itemResponse =
      response?.item?.filter((i) => i.linkId === item.linkId) ?? [];

    return item.type === QuestionnaireItemType.group ? (
      <QuestionnaireFormRepeatedGroup
        key={item.linkId}
        item={item}
        response={itemResponse}
        onChange={setItems}
      />
    ) : (
      <QuestionnaireFormRepeatableItem
        key={item.linkId}
        item={item}
        response={itemResponse?.[0]}
        onChange={setItems}
      />
    );
  });

  return (
    <div className="mx-auto flex w-full max-w-[800px] flex-col gap-8 p-12">
      <Badge className="text-lg">{questionnaire.title}</Badge>
      <Alert variant="destructive" className="bg-white">
        <TriangleAlert className="size-4" />
        <AlertTitle>Disclaimer</AlertTitle>
        <AlertDescription>
          Your answers will only be viewed by your medical team and will not be
          shared with any partners without your explicit consent.
        </AlertDescription>
      </Alert>
      {renderPages ? (
        <div>{form[activeStep]}</div>
      ) : (
        <div className="space-y-12">{form}</div>
      )}
      <ButtonGroup />
    </div>
  );
};

function ButtonGroup() {
  const { activeStep, prevStep, nextStep, getNumberOfPages } =
    useQuestionnaireStore((s) => s);

  const showBackButton = activeStep > 0;
  const showNextButton = activeStep < getNumberOfPages() - 1;
  const showSubmitButton = activeStep === getNumberOfPages() - 1;

  return (
    <div className="flex flex-col items-center gap-2">
      {showBackButton && (
        <Button
          type="button"
          className="w-full bg-white"
          variant="outline"
          onClick={prevStep}
        >
          Back
        </Button>
      )}
      {showNextButton && (
        <Button
          type="button"
          className="w-full"
          onClick={() => {
            // const form = e.currentTarget.closest('form') as HTMLFormElement;

            // if (form.reportValidity()) {
            nextStep();
            // }
          }}
        >
          Next
        </Button>
      )}
      {showSubmitButton ? (
        <Button type="submit" className="w-full">
          Submit
        </Button>
      ) : null}
    </div>
  );
}
