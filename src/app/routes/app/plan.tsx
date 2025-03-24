import { useParams } from 'react-router-dom';

import { CarePlan } from '@/features/plans/components/care-plan';

export const PlanRoute = () => {
  const { id } = useParams();

  if (!id) {
    return null;
  }

  return <CarePlan id={id} />;
};
