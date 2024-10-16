import { ContentLayout } from '@/components/layouts';
import { H1 } from '@/components/ui/typography';
import { RdnPatientsList } from '@/features/rdns/components/rdn-patients-list';
import { Authorization, ROLES } from '@/lib/authorization';

export const MembersRoute = () => {
  return (
    <ContentLayout title="Your Members">
      <Authorization
        forbiddenFallback={<div>Only rdn can view this.</div>}
        allowedRoles={[ROLES.RDN_CLINICIAN]}
      >
        <section>
          <H1>Your members</H1>
          <RdnPatientsList />
        </section>
      </Authorization>
    </ContentLayout>
  );
};
