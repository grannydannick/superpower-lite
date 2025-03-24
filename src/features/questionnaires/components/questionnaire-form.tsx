import { Questionnaire, QuestionnaireResponseItem } from '@medplum/fhirtypes';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { QuestionnaireFormPageSequence } from '@/features/questionnaires/components/questionnaire-page-sequence';
import {
  QuestionnaireStoreProvider,
  useQuestionnaireStore,
} from '@/features/questionnaires/stores/questionnaire-store';

export const QuestionnaireForm = ({
  questionnaire,
  onSubmit,
  className,
}: {
  questionnaire: Questionnaire;
  onSubmit: (item: QuestionnaireResponseItem[]) => void;
  className?: string;
}) => {
  return (
    <QuestionnaireStoreProvider questionnaire={questionnaire}>
      <QuestionnaireFormConsumer onSubmit={onSubmit} className={className} />
    </QuestionnaireStoreProvider>
  );
};

const QuestionnaireFormConsumer = ({
  onSubmit,
  className,
}: {
  onSubmit: (item: QuestionnaireResponseItem[]) => void;
  className?: string;
}) => {
  const navigate = useNavigate();
  const response = useQuestionnaireStore((s) => s.response);

  return (
    <form
      className={className}
      onSubmit={(e) => {
        e.preventDefault();

        if (response.item) onSubmit(response.item);
      }}
    >
      <div className="sticky top-0 w-full max-w-screen-md space-y-4 bg-white">
        <Button
          variant="white"
          size="icon"
          className="absolute left-6 top-6 rounded-full p-4 shadow-lg"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="size-4" />
        </Button>
      </div>
      <QuestionnaireFormPageSequence />
    </form>
  );
};
