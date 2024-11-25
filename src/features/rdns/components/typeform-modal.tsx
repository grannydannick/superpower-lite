import { X } from 'lucide-react';
import moment from 'moment-timezone';
import { ReactNode, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { H3, H4, Body2 } from '@/components/ui/typography';
import { sortTypeformAnswers } from '@/lib/utils';
import { FormResponse, TypeformWebhook, User } from '@/types/api';

interface TypeformModalProps {
  typeforms: TypeformWebhook[] | undefined;
  patient: User;
  children: ReactNode;
}

const QAItem = ({
  question,
  answer,
  description,
}: {
  question: string;
  answer: string;
  description?: string;
}) => (
  <div className="mb-6 border-b border-gray-300 p-4">
    <div className="mb-2 flex">
      <H4 className="mr-2">Q:</H4>
      <p className="font-bold text-zinc-700">{question}</p>
    </div>
    {description && (
      <div className="mb-2 flex">
        <h4 className="w-auto pr-6 font-semibold text-zinc-800"> </h4>
        <p className="text-sm text-zinc-500">{description}</p>
      </div>
    )}
    <div className="flex">
      <H4 className="mr-2">A:</H4>
      <p className="text-zinc-700">{answer}</p>
    </div>
  </div>
);

export const TypeformModal = ({
  typeforms,
  children,
  patient,
}: TypeformModalProps) => {
  const [selectedFormId, setSelectedFormId] = useState<string | undefined>(
    typeforms && typeforms[0]?.formId,
  );

  if (!typeforms || typeforms.length === 0) {
    return null;
  }

  const selectedForm = typeforms.find((form) => form.formId === selectedFormId);

  // TODO: move the association of question to answers to the backend ~ MG 2024-11-13
  const displayAnswers = (formResponse: FormResponse) => {
    formResponse.answers = sortTypeformAnswers(formResponse.answers);

    return formResponse.answers.map((answer, index) => {
      const field = formResponse.definition.fields.find(
        (field) =>
          field.id === answer.field.id || field.ref === answer.field.ref,
      );

      if (!field) return null;

      let answerText = 'N/A';
      switch (answer.type) {
        case 'text':
        case 'long_text':
        case 'short_text':
          answerText = answer.text || 'N/A';
          break;
        case 'choice':
          answerText = answer.choice?.label || 'N/A';
          break;
        case 'choices':
          if (answer.choices && Array.isArray(answer.choices.labels)) {
            answerText = answer.choices.labels.join(', ');
          } else {
            answerText = 'N/A';
          }
          break;
        case 'number':
          answerText = answer.number?.toString() || 'N/A';
          break;
        case 'boolean':
          answerText =
            'boolean' in answer && typeof (answer as any).boolean === 'boolean'
              ? (answer as any).boolean
                ? 'Yes'
                : 'No'
              : 'N/A';
          break;
        default:
          answerText = 'N/A';
      }

      return (
        <QAItem
          key={index}
          question={field.title}
          answer={answerText}
          description={answer.description}
        />
      );
    });
  };

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="flex size-full flex-col rounded-none shadow-lg">
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center space-x-4">
            <p className="text-lg font-semibold text-zinc-800">
              Typeform Responses
            </p>
            <Select
              value={selectedFormId}
              onValueChange={(value) => setSelectedFormId(value)}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Form" />
              </SelectTrigger>
              <SelectContent>
                {typeforms.map((form) => (
                  <SelectItem key={form.formId} value={form.formId}>
                    {form.formResponse.definition.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <SheetClose>
            <Button className="flex items-center justify-center rounded-full bg-gray-200 p-2 hover:bg-gray-300">
              <X className="size-5 text-zinc-700" />
            </Button>
          </SheetClose>
        </div>

        {/* Modal Body */}
        <div className="max-h-[calc(100vh-150px)] overflow-y-auto p-4">
          {selectedForm ? (
            <div>
              <div className="mb-4 border bg-vermillion-300 p-4">
                <H3 className="text-center">
                  {selectedForm.formResponse.definition.title}
                </H3>
                <div className="mt-4 flex">
                  <div className="w-1/2">
                    <div className="mb-2 flex">
                      <span className="w-auto pr-2 font-bold text-zinc-800">
                        Patient Name:
                      </span>
                      <p className="font-bold text-zinc-800">
                        {patient.firstName} {patient.lastName} (
                        {patient.gender.charAt(0)})
                      </p>
                    </div>
                    <div className="mb-2 flex">
                      <span className="w-auto pr-2 font-bold text-zinc-800">
                        Patient DOB:
                      </span>
                      <p className="font-bold text-zinc-800">
                        {moment(patient.dateOfBirth).format('MMMM D, YYYY')}{' '}
                        <span className="text-sm text-zinc-600">
                          (Age: {moment().diff(patient.dateOfBirth, 'years')})
                        </span>
                      </p>
                    </div>
                    <div className="mb-2 flex">
                      <span className="w-auto pr-2 font-bold text-zinc-800">
                        Patient Email:
                      </span>
                      <p className="font-bold text-zinc-800">{patient.email}</p>
                    </div>
                    <div className="mb-2 flex">
                      <span className="w-auto pr-2 font-bold text-zinc-800">
                        Patient ID:
                      </span>
                      <p className="font-bold text-zinc-800">{patient.id}</p>
                    </div>
                    <div className="mb-2 flex">
                      <span className="w-auto pr-2 font-bold text-zinc-800">
                        Calculated Score:
                      </span>
                      <p className="font-bold text-zinc-800">
                        {selectedForm.formResponse.calculated?.score ?? 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="w-1/2">
                    <div className="mb-2 flex">
                      <span className="w-auto pr-2 font-bold text-zinc-800">
                        Form ID:
                      </span>
                      <p className="font-bold text-zinc-800">
                        {selectedForm.formId}
                      </p>
                    </div>
                    <div className="mb-2 flex">
                      <span className="w-auto pr-2 font-bold text-zinc-800">
                        Submitted At:
                      </span>
                      <p className="font-bold text-zinc-800">
                        {moment(selectedForm.formResponse.submitted_at).format(
                          'MMMM Do YYYY, h:mm:ss a',
                        )}
                      </p>
                    </div>
                    <div className="mb-2 flex">
                      <span className="w-auto pr-2 font-bold text-zinc-800">
                        Event Type:
                      </span>
                      <p className="font-bold text-zinc-800">
                        {selectedForm.formResponse.event_type}
                      </p>
                    </div>

                    <div className="mb-2 flex">
                      <span className="w-auto pr-2 font-bold text-zinc-800">
                        Token:
                      </span>
                      <p className="font-bold text-zinc-800">
                        {selectedForm.formResponse.token}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <p className="mb-1 text-lg font-semibold text-zinc-800">
                  Answers:
                </p>
                {displayAnswers(selectedForm.formResponse)}
              </div>
            </div>
          ) : (
            <Body2>No Typeform responses available.</Body2>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
