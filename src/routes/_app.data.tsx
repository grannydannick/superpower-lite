import { createFileRoute, Outlet } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import * as z from 'zod';

const dataSearchSchema = z.object({
  category: z.string().optional(),
  modal: z
    .enum(['biological-age', 'superpower-score'])
    .optional()
    .catch(undefined),
});

export const Route = createFileRoute('/_app/data')({
  validateSearch: zodValidator(dataSearchSchema),
  component: Outlet,
});
