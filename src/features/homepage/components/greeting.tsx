import { Package } from 'lucide-react';
import { useMemo } from 'react';

import { SettingsIcon } from '@/components/icons/settings-icon';
import ProfileDropdown from '@/components/shared/profile-dropdown';
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

  const dropdownLinks = [
    {
      icon: Package,
      name: 'Your Orders',
      to: '/orders',
    },
    {
      icon: SettingsIcon,
      name: 'Settings',
      to: './settings',
    },
  ];

  return (
    <div className="relative z-50 flex items-start justify-between">
      <H2 className="text-zinc-900">
        Welcome back, <br /> {user?.firstName}
      </H2>
      {initials && (
        <ProfileDropdown
          side="top"
          links={dropdownLinks}
          trigger={
            <div
              className={cn(
                'flex size-12 items-center justify-center rounded-full',
                'bg-gradient-to-br from-orange-400 via-vermillion-900 to-vermillion-700',
                'pt-0.5 text-lg font-semibold leading-none text-white',
                'outline outline-1 -outline-offset-1 outline-black/10',
              )}
            >
              {initials}
            </div>
          }
        />
      )}
    </div>
  );
};
