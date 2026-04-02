import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/concierge/')({
  component: ConciergeIndexComponent,
});

function ConciergeIndexComponent() {
  return null;
}
