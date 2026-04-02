import { createFileRoute, notFound, redirect } from '@tanstack/react-router';

import { ContentLayout } from '@/components/layouts';
import { UsersList } from '@/features/users/components/users-list';
import { authenticatedUserQueryOptions } from '@/lib/auth';
import { ROLES } from '@/lib/authorization';

export const Route = createFileRoute('/_app/_maps/users')({
  beforeLoad: async ({ context }) => {
    const user = await context.queryClient
      .ensureQueryData(authenticatedUserQueryOptions())
      .catch(() => null);
    if (user === null) {
      throw notFound();
    }
    // authRole is the new ts-auth field. Fall back to the legacy role array
    // during the migration period while not all sessions have authRole set.
    const isAdmin =
      user.authRole === 'admin' ||
      (!user.authRole && user.role.includes(ROLES.SUPER_ADMIN));
    if (!isAdmin) {
      throw redirect({ to: '/', replace: true });
    }
  },
  component: () => (
    <ContentLayout title="Admin - Users">
      <UsersList />
    </ContentLayout>
  ),
});
