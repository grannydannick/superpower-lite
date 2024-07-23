import { Spinner } from '@/components/ui/spinner';
import { Consult } from '@/types/api';

import { useConsults } from '../api/get-consults';

import { ConsultCard } from './consult-card';

export const ConsultsList = () => {
  const consultsQuery = useConsults();

  if (consultsQuery.isLoading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!consultsQuery.data) return null;

  return (
    <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-3">
      {consultsQuery.data.map((consult: Consult, i: number) => (
        <ConsultCard key={i} consultId={consult.id} />
      ))}
    </div>
  );
};
