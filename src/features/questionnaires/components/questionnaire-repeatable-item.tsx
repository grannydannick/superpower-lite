import {
  QuestionnaireItem,
  QuestionnaireResponseItem,
} from '@medplum/fhirtypes';

import { Body1 } from '@/components/ui/typography';
import { useQuestionnaireStore } from '@/features/questionnaires/stores/questionnaire-store';

import { QuestionnaireItemType } from '../utils/questionnaire';

import { QuestionnaireFormItem } from './questionnaire-item';

interface QuestionnaireFormRepeatableItemProps {
  item: QuestionnaireItem;
  response?: QuestionnaireResponseItem;
  onChange: (items: QuestionnaireResponseItem[]) => void;
}

export const QuestionnaireFormRepeatableItem = ({
  item,
  response,
  onChange,
}: QuestionnaireFormRepeatableItemProps) => {
  const checkForQuestionEnabled = useQuestionnaireStore(
    (s) => s.checkForQuestionEnabled,
  );

  // const [number, setNumber] = useState(
  //   getNumberOfRepeats(item, response ?? { linkId: item.linkId }),
  // );
  if (!checkForQuestionEnabled(item)) {
    return null;
  }

  if (!response) {
    return null;
  }

  if (item.type === QuestionnaireItemType.display) {
    return <p key={item.linkId}>{item.text}</p>;
  }

  // const showAddButton =
  //   item?.repeats &&
  //   item.type !== QuestionnaireItemType.choice &&
  //   item.type !== QuestionnaireItemType.openChoice;

  // Styling reason to avoid duplicate text
  if (item.type === QuestionnaireItemType.boolean) {
    return (
      <QuestionnaireFormItem
        key={item.linkId}
        item={item}
        response={response}
        onChange={(r) => onChange([r])}
        index={0}
      />
    );
  }

  return (
    // <FormSection
    //   key={props.item.linkId}
    //   htmlFor={props.item.linkId}
    //   title={props.item.text}
    //   withAsterisk={props.item.required}
    // >
    <div className="space-y-2">
      <Body1>
        {item.text}
        {item.required ? <span className="italic text-pink-700">*</span> : null}
      </Body1>

      {/*Should be ...Array(number)*/}
      {[...Array(1)].map((_, index) => (
        <QuestionnaireFormItem
          key={`${item.linkId}-${index}`}
          item={item}
          response={response}
          onChange={(r) => onChange([r])}
          index={index}
        />
      ))}
    </div>
    //   {showAddButton && (
    //     <Anchor onClick={() => setNumber((n) => n + 1)}>Add Item</Anchor>
    //   )}
    // </FormSection>
  );
};

// function getNumberOfRepeats(
//   item: QuestionnaireItem,
//   response: QuestionnaireResponseItem,
// ): number {
//   if (
//     item.type === QuestionnaireItemType.choice ||
//     item.type === QuestionnaireItemType.openChoice
//   ) {
//     return 1;
//   }
//   const answers = response.answer;
//   return answers?.length ? answers.length : 1;
// }
