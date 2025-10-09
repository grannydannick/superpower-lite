import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { IntakeQuestionnaire } from '@/features/questionnaires/components/intake-questionnaire';
import { RxIntakeQuestionnaire } from '@/features/questionnaires/components/rx-intake-questionnaire';

export const QuestionnaireRoute = () => {
  const { type } = useParams();
  const navigate = useNavigate();

  const onSubmit = () => {
    toast.success('Thanks for submission!');
    navigate('/');
  };

  if (type === 'rx-intake') {
    return <RxIntakeQuestionnaire onSubmit={onSubmit} />;
  }

  // default (covers `/questionnaire` and `/questionnaire/intake`)
  return <IntakeQuestionnaire showIntro={true} onSubmit={onSubmit} />;
};
