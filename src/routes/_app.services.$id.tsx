import { createFileRoute } from '@tanstack/react-router';

import { LegacyServiceBridge } from '@/features/marketplace/pages/legacy-service-bridge';

export const Route = createFileRoute('/_app/services/$id')({
  component: LegacyServiceBridgeComponent,
});

function LegacyServiceBridgeComponent() {
  const { id } = Route.useParams();
  return <LegacyServiceBridge serviceId={id} />;
}
