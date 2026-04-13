import {
  QuestionnaireItem,
  QuestionnaireResponseItemAnswer,
} from '@medplum/fhirtypes';
import { Plus } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';

import { Button } from '../../button';
import { Input } from '../../input';
import { Textarea } from '../../textarea';
import { SUPERPOWER_INPUT_SUGGESTION_EXTENSION_URL } from '../const/system-urls';

interface TextSuggestionsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
  currentValue?: string;
}

function TextSuggestions({
  suggestions,
  onSelect,
  currentValue = '',
}: TextSuggestionsProps) {
  const selected = new Set<string>();
  for (const part of currentValue.toLowerCase().split(',')) {
    const trimmed = part.trim();
    if (trimmed !== '') selected.add(trimmed);
  }

  const visible: string[] = [];
  for (const s of suggestions) {
    if (!selected.has(s.toLowerCase())) visible.push(s);
  }

  if (visible.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <span className="pl-1 text-sm text-muted-foreground">Suggestions</span>
      <div className="flex flex-wrap gap-2">
        {visible.map((suggestion) => (
          <Button
            key={suggestion}
            type="button"
            onClick={() => onSelect(suggestion)}
            variant="outline"
            size="small"
            className="gap-2 text-secondary shadow-none"
          >
            {suggestion}
            <Plus className="size-3.5 text-muted-foreground" />
          </Button>
        ))}
      </div>
    </div>
  );
}

interface InputWithSuggestionsProps {
  item: QuestionnaireItem;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  onChangeAnswer: (answer: QuestionnaireResponseItemAnswer) => void;
  onKeyDown?: (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  variant: 'input' | 'textarea';
}

export function InputWithSuggestions({
  item,
  name,
  defaultValue,
  placeholder,
  onChangeAnswer,
  onKeyDown,
  variant,
}: InputWithSuggestionsProps) {
  const [textValue, setTextValue] = useState(defaultValue ?? '');
  const textInputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

  const textSuggestions =
    item.extension?.reduce<string[]>((acc, e) => {
      if (
        e.url === SUPERPOWER_INPUT_SUGGESTION_EXTENSION_URL &&
        e.valueString != null
      ) {
        acc.push(e.valueString);
      }
      return acc;
    }, []) ?? [];

  const onChangeAnswerRef = useRef(onChangeAnswer);
  onChangeAnswerRef.current = onChangeAnswer;

  const handleSuggestionSelect = useCallback((suggestion: string) => {
    const el = textInputRef.current;
    if (el == null) return;

    const current = el.value.trim();
    const next = current ? `${current}, ${suggestion}` : suggestion;
    el.value = next;
    setTextValue(next);
    onChangeAnswerRef.current({ valueString: next });
  }, []);

  return (
    <div className="relative flex h-full flex-col justify-between gap-4">
      {variant === 'textarea' ? (
        <Textarea
          ref={textInputRef as React.RefObject<HTMLTextAreaElement>}
          id={name}
          name={name}
          required={item.required}
          defaultValue={defaultValue}
          placeholder={placeholder}
          onChange={(e) => {
            const newValue = e.currentTarget.value;
            setTextValue(newValue);
            onChangeAnswer({ valueString: newValue });
          }}
          onKeyDown={onKeyDown}
          rows={4}
          className="scroll-py-4"
        />
      ) : (
        <Input
          ref={textInputRef as React.RefObject<HTMLInputElement>}
          placeholder={placeholder ?? ''}
          id={name}
          name={name}
          required={item.required}
          defaultValue={defaultValue}
          onChange={(e) => {
            const newValue = e.currentTarget.value;
            setTextValue(newValue);
            onChangeAnswer({ valueString: newValue });
          }}
          onKeyDown={onKeyDown}
        />
      )}
      <TextSuggestions
        suggestions={textSuggestions}
        onSelect={handleSuggestionSelect}
        currentValue={textValue}
      />
    </div>
  );
}
