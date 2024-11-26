import { MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown';
import { PlansModal } from '@/features/rdns/components/plans-modal';
import { TypeformModal } from '@/features/rdns/components/typeform-modal';
import { useCurrentPatient } from '@/features/rdns/hooks/use-current-patient';
import { User } from '@/types/api';

export const ActionCell = ({ patient }: { patient: User }) => {
  const { setPatient } = useCurrentPatient();
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="size-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal width={16} height={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => {
            setPatient(patient);
            navigate('/data');
          }}
        >
          Data
        </DropdownMenuItem>
        <TypeformModal>
          <DropdownMenuItem
            onSelect={(event) => {
              setPatient(patient);
              event.preventDefault();
            }}
          >
            View typeforms
          </DropdownMenuItem>
        </TypeformModal>
        <PlansModal>
          <DropdownMenuItem
            onSelect={(event) => {
              setPatient(patient);
              event.preventDefault();
            }}
          >
            View plans
          </DropdownMenuItem>
        </PlansModal>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
