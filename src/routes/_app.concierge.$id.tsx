import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/concierge/$id')({
  component: ConciergeIdComponent,
});

function ConciergeIdComponent() {
  return null;
}
