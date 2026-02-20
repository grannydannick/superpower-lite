import { useParams } from 'react-router';

import { Head } from '@/components/seo/head';
import { ProtocolOverview } from '@/features/protocol/components/protocol-overview';

/**
 * Route for a specific protocol by ID
 * Path: /protocol/plans/:id
 */
export const ProtocolByIdRoute = () => {
  const { id } = useParams();

  if (!id) {
    return null;
  }

  return (
    <>
      <Head title="Protocol" />
      <ProtocolOverview protocolId={id} />
    </>
  );
};
