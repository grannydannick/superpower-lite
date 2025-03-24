import * as React from 'react';

import { useUser } from './auth';

export enum ROLES {
  SUPER_ADMIN = 'SUPER_ADMIN',
  MEMBER = 'MEMBER',
}

type RoleTypes = keyof typeof ROLES;

// policyCheck={POLICIES['comment:delete'](
//     user.data as User,
//     comment,
//   )}

// export const POLICIES = {
//   'comment:delete': (user: User, comment: Comment) => {
//     if (user.role === 'ADMIN') {
//       return true;
//     }
//
//     if (user.role === 'USER' && comment.author?.id === user.id) {
//       return true;
//     }
//
//     return false;
//   },
// };

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

type AuthorizationProps = {
  forbiddenFallback?: React.ReactNode;
  children: React.ReactNode;
} & (
  | {
      allowedRoles: RoleTypes[];
      policyCheck?: never;
    }
  | {
      allowedRoles?: never;
      policyCheck: boolean;
    }
);

export const Authorization = ({
  policyCheck,
  allowedRoles,
  forbiddenFallback = null,
  children,
}: AuthorizationProps) => {
  const { checkAccess } = useAuthorization();

  let canAccess = false;

  if (allowedRoles) {
    canAccess = checkAccess({ allowedRoles });
  }

  if (typeof policyCheck !== 'undefined') {
    canAccess = policyCheck;
  }

  return <>{canAccess ? children : forbiddenFallback}</>;
};
