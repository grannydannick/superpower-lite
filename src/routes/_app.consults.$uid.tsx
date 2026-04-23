import { createFileRoute } from '@tanstack/react-router';

import { ConsultDetail } from '@/features/consults/components/consult-detail';

export const Route = createFileRoute('/_app/consults/$uid')({
  component: ConsultDetail,
});
