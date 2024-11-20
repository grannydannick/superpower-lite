import moment from 'moment';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown';
import { usePlans } from '@/features/action-plan/api';
import { useCurrentPatient } from '@/features/rdns/hooks/use-current-patient';
import { User } from '@/types/api';

export const PlansButton = ({ patient }: { patient: User }) => {
  const { setPatient, selectedPatient } = useCurrentPatient();
  const plansQuery = usePlans();
  const navigate = useNavigate();

  if (!selectedPatient) {
    return (
      <Button
        variant="outline"
        onClick={() => {
          setPatient(patient);
        }}
      >
        Load Plans
      </Button>
    );
  }

  const plans = plansQuery.data?.actionPlans;

  if (!plans) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Select plan</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>
          {plans.length ? 'Available Plans' : 'No plans available'}
        </DropdownMenuLabel>
        {plans.length ? <DropdownMenuSeparator /> : null}
        <DropdownMenuGroup>
          {plans.map((p) => (
            <DropdownMenuItem
              key={p.id}
              onClick={() => navigate(`/plans/${p.orderId}`)}
            >
              {moment(p.timestamp).format('DD MMMM')}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
