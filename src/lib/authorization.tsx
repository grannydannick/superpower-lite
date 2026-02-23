import * as React from 'react';

import { useUser } from './auth';

export enum ROLES {
  SUPER_ADMIN = 'SUPER_ADMIN',
  MEMBER = 'MEMBER',
}

type RoleTypes = keyof typeof ROLES;

export const useAuthorization = () => {
  const user = useUser();

  if (!user.data) {
    throw Error('User does not exist!');
  }

  /**
   * This is used when we need to make sure its admin actor acting on behalf of user
   */
  const checkAdminActorAccess = React.useCallback(() => {
    return !!user.data.adminActor;
  }, [user.data]);

  /**
   * This is used to make sure user has role
   */
  const checkAccess = React.useCallback(
    ({ allowedRoles }: { allowedRoles: RoleTypes[] }) => {
      if (allowedRoles && allowedRoles.length > 0 && user.data) {
        return user.data.role.some((role) => allowedRoles.includes(role));
      }

      return true;
    },
    [user.data],
  );

  return { checkAccess, checkAdminActorAccess, role: user.data.role };
};
