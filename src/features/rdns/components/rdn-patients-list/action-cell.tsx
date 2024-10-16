import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { useCurrentPatient } from '@/features/rdns/hooks/use-current-patient';
import { User } from '@/types/api';

export const ActionCell = ({ patient }: { patient: User }) => {
  const { setPatient } = useCurrentPatient();
  const navigate = useNavigate();

  return (
    <div className="flex w-full justify-end gap-2">
      <Button
        onClick={() => {
          setPatient(patient);
          navigate('/data');
        }}
      >
        Data
      </Button>
    </div>
  );
};
