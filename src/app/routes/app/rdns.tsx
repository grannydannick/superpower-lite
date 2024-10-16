import { ContentLayout } from '@/components/layouts';
import { AssignmentsList } from '@/features/rdns/components/assignments-list';
import { CreateRdnForm } from '@/features/rdns/components/create-rdn-form';
import { RdnsList } from '@/features/rdns/components/rdns-list/rdns-list';
import { Authorization, ROLES } from '@/lib/authorization';

export const RdnsRoute = () => {
  return (
    <ContentLayout title="Admin - RDNs">
      <Authorization
        forbiddenFallback={<div>Only admin can view this.</div>}
        allowedRoles={[ROLES.SUPER_ADMIN]}
      >
        <section className="space-y-10">
          <CreateRdnForm />
          <RdnsList />
        </section>
        <hr className="px-10" />
        <section>
          <AssignmentsList />
        </section>
      </Authorization>
    </ContentLayout>
  );
};
