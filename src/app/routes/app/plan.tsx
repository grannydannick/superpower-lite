import { useNavigate, useParams } from 'react-router-dom';

import { ClinicianNote } from '@/features/action-plan/components/clinician-note';

export const PlanRoute = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  if (!orderId) {
    navigate('/', { replace: true });
  }

  return <ClinicianNote orderId={orderId} />;
};
