import { createFileRoute } from '@tanstack/react-router';

import { NewConsultFlow } from '@/features/consults/components/new-consult-flow';

export const Route = createFileRoute('/_app/consults/new')({
  component: NewConsultFlow,
});
