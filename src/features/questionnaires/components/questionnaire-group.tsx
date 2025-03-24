import {
  QuestionnaireItem,
  QuestionnaireResponseItem,
} from '@medplum/fhirtypes';
import { SmileIcon } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Body1, H2 } from '@/components/ui/typography';
import { QuestionnaireFormRepeatableItem } from '@/features/questionnaires/components/questionnaire-repeatable-item';
import { useQuestionnaireStore } from '@/features/questionnaires/stores/questionnaire-store';
import { QuestionnaireItemType } from '@/features/questionnaires/utils/questionnaire';

interface QuestionnaireFormGroupProps {
  item: QuestionnaireItem;
  response: QuestionnaireResponseItem;
  onChange: (response: QuestionnaireResponseItem[]) => void;
}

export const QuestionnaireFormGroup = ({
  item,
  response,
  onChange,
}: QuestionnaireFormGroupProps) => {
  const checkForQuestionEnabled = useQuestionnaireStore(
    (s) => s.checkForQuestionEnabled,
  );

  const isPage = !!item.extension?.find((e) =>
    e.valueCodeableConcept?.coding?.find((c) => c.code === 'page'),
  );

  function onSetGroup(newResponseItem: QuestionnaireResponseItem[]): void {
    const newResponse = response.item?.map((current) => {
      const matchingItem = newResponseItem.find(
        (newResponse) => newResponse.id === current.id,
      );
      return matchingItem ?? current;
    });
    // This checks to see if there were any nested repeated groups that we need to add
    const mergedResponse = newResponse?.concat(newResponseItem.slice(1));
    const groupResponse = { ...response, item: mergedResponse };
    onChange([groupResponse]);
  }

  if (!checkForQuestionEnabled(item)) {
    if (!isPage) return null;

    return (
      <div className="space-y-6">
        <H2 className="italic">{item.text}</H2>
        <Alert>
          <SmileIcon className="size-4" />
          <AlertTitle>Heads up!</AlertTitle>
          <AlertDescription>
            You do not have to fill this section, move forward
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div key={item.linkId} className="space-y-4">
      {item.text ? (
        isPage ? (
          <H2 className="italic">{item.text}</H2>
        ) : (
          <Body1>{item.text}</Body1>
        )
      ) : null}
      <div className="flex flex-col gap-6">
        {item.item?.map((item) => {
          if (item.type === QuestionnaireItemType.group) {
            return item.repeats ? (
              <QuestionnaireFormRepeatedGroup
                key={item.linkId}
                item={item}
                response={
                  response.item?.filter((i) => i.linkId === item.linkId) ?? []
                }
                onChange={onSetGroup}
              />
            ) : (
              <QuestionnaireFormGroup
                key={item.linkId}
                item={item}
                response={
                  response.item?.find((i) => i.linkId === item.linkId) ?? {
                    linkId: item.linkId,
                  }
                }
                onChange={onSetGroup}
              />
            );
          }
          return (
            <QuestionnaireFormRepeatableItem
              key={item.linkId}
              item={item}
              response={response.item?.find((i) => i.linkId === item.linkId)}
              onChange={onSetGroup}
            />
          );
        })}
      </div>
    </div>
  );
};

interface QuestionnaireFormRepeatableGroupProps {
  item: QuestionnaireItem;
  response: QuestionnaireResponseItem[];
  onChange: (responses: QuestionnaireResponseItem[]) => void;
}

export const QuestionnaireFormRepeatedGroup = ({
  item,
  response,
  onChange,
}: QuestionnaireFormRepeatableGroupProps) => {
  // const [responses, setResponses] = useState(props.response);
  // TODO: remove when repeatable is ready
  const responses = response;

  if (responses.length === 0) {
    return null;
  }

  function handleRepeatableGroup(
    newResponseItems: QuestionnaireResponseItem[],
    index: number,
  ): void {
    const newResponses = responses.map((responses, idx) =>
      idx === index ? newResponseItems[0] : responses,
    );
    // setResponses(newResponses);
    onChange(newResponses);
  }

  // function insertNewGroup(): void {
  //   const newResponse = buildInitialResponseItem(props.item);
  //   setResponses([...responses, newResponse]);
  // }

  return (
    <>
      {responses.map((response, idx) => (
        <QuestionnaireFormGroup
          key={response.id}
          item={item}
          response={response}
          onChange={(r) => handleRepeatableGroup(r, idx)}
        />
      ))}
      {/*{props.item.repeats && (*/}
      {/*  <Anchor*/}
      {/*    onClick={insertNewGroup}*/}
      {/*  >{`Add Group: ${props.item.text}`}</Anchor>*/}
      {/*)}*/}
    </>
  );
};
