import { createFileRoute } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import * as z from 'zod';

import { ConciergeLayout } from '@/features/messages/layouts/concierge-layout';

const conciergeSearchSchema = z.object({
  defaultMessage: z.string().optional(),
  preset: z.string().optional(),
});

export const Route = createFileRoute('/_app/concierge')({
  validateSearch: zodValidator(conciergeSearchSchema),
  component: ConciergeLayout,
});
