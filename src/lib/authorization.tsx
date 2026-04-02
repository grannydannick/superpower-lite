import * as React from 'react';

import { useUser } from './auth';

export enum ROLES {
  SUPER_ADMIN = 'SUPER_ADMIN',
  MEMBER = 'MEMBER',
}

type RoleTypes = keyof typeof ROLES;

export const useAuthorization = () => {
  const user = useUser();

  /**
   * This is used when we need to make sure its admin actor acting on behalf of user
   */
  const checkAdminActorAccess = React.useCallback(() => {
    return !!user.data?.adminActor;
  }, [user.data]);

  /**
   * This is used to make sure user has role
   */
  const checkAccess = React.useCallback(
    ({ allowedRoles }: { allowedRoles: RoleTypes[] }) => {
      if (allowedRoles.length === 0 || !user.data) {
        return false;
      }

      // authRole is the new ts-auth field. Fall back to the legacy role array
      // during the migration period while not all sessions have authRole set.
      const { authRole } = user.data;
      if (authRole === 'admin') return allowedRoles.includes(ROLES.SUPER_ADMIN);
      if (authRole === 'user') return allowedRoles.includes(ROLES.MEMBER);

      return user.data.role.some((role) => allowedRoles.includes(role));
    },
    [user.data],
  );

  return { checkAccess, checkAdminActorAccess, role: user.data?.role ?? [] };
};
