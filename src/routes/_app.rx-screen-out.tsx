import { createFileRoute, redirect } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import { z } from 'zod';

import { RxScreenOut } from '@/components/ui/questionnaire/rx-screen-out';

export const Route = createFileRoute('/_app/rx-screen-out')({
  validateSearch: zodValidator(
    z.object({
      // Set by the questionnaire route when navigating here after a screen-out.
      // If missing, the user navigated here directly — redirect to home.
      from: z.literal('questionnaire').optional().catch(undefined),
    }),
  ),
  beforeLoad: ({ search }) => {
    if (search.from !== 'questionnaire') {
      throw redirect({ to: '/', replace: true });
    }
  },
  component: RxScreenOut,
});
