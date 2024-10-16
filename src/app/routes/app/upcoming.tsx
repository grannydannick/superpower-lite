import { ContentLayout } from '@/components/layouts';
import { H1 } from '@/components/ui/typography';
import { UpcomingCallsList } from '@/features/rdns/components/upcoming-calls-list';
import { Authorization, ROLES } from '@/lib/authorization';

export const UpcomingRoute = () => {
  return (
    <ContentLayout title="Upcoming">
      <Authorization
        forbiddenFallback={<div>Only rdn can view this.</div>}
        allowedRoles={[ROLES.RDN_CLINICIAN]}
      >
        <section>
          <H1>Upcoming Calls</H1>
          <UpcomingCallsList />
        </section>
      </Authorization>
    </ContentLayout>
  );
};
