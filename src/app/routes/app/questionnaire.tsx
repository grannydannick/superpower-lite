import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { RxQuestionnaireName, RX_ASSESSMENTS } from '@/const/questionnaire';
import { IntakeQuestionnaire } from '@/features/questionnaires/components/intake-questionnaire';
import { RxQuestionnaire } from '@/features/questionnaires/components/rx-questionnaire';

export const QuestionnaireRoute = () => {
  const { type } = useParams();
  const navigate = useNavigate();

  const onSubmit = () => {
    toast.success('Thanks for submission!');
    navigate('/');
  };

  if (RX_ASSESSMENTS.includes(type as RxQuestionnaireName)) {
    return (
      <RxQuestionnaire onSubmit={onSubmit} name={type as RxQuestionnaireName} />
    );
  }

  // default (covers `/questionnaire` and `/questionnaire/intake`)
  return <IntakeQuestionnaire showIntro={true} onSubmit={onSubmit} />;
};
