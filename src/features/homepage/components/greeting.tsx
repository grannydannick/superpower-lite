import { useMemo } from 'react';

import { H2 } from '@/components/ui/typography';
import { useUser } from '@/lib/auth';
import { cn } from '@/lib/utils';

export const Greeting = () => {
  const { data: user } = useUser();

  const initials = useMemo(() => {
    return user?.firstName && user?.lastName
      ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
      : user?.firstName
        ? user.firstName[0].toUpperCase()
        : '';
  }, [user]);

  return (
    <div className="relative z-50 flex items-start justify-between">
      <H2 className="text-zinc-900">
        Welcome back, <br /> {user?.firstName}
      </H2>
      {initials && (
        <div
          className={cn(
            'flex size-12 items-center justify-center rounded-full',
            'bg-gradient-to-br from-orange-400 via-vermillion-900 to-zinc-950',
            'text-white font-semibold text-lg leading-none pt-0.5',
            'outline outline-1 -outline-offset-1 outline-black/10',
          )}
        >
          {initials}
        </div>
      )}
    </div>
  );
};
