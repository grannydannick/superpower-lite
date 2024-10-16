import { ContentLayout } from '@/components/layouts';
import { UsersList } from '@/features/users/components/users-list';
import { Authorization, ROLES } from '@/lib/authorization';

export const UsersRoute = () => {
  return (
    <ContentLayout title="Admin - Users">
      <Authorization
        forbiddenFallback={<div>Only admin can view this.</div>}
        allowedRoles={[ROLES.SUPER_ADMIN]}
      >
        <UsersList />
      </Authorization>
    </ContentLayout>
  );
};
