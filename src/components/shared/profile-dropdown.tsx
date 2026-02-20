import { LucideIcon } from 'lucide-react';
import { FC, ReactNode, SVGProps } from 'react';
import { NavLink } from 'react-router';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown';
import { cn } from '@/lib/utils';

export type ProfileDropdownLink = {
  name: string;
  to: string;
  icon: LucideIcon | FC<SVGProps<SVGSVGElement>>;
  testid?: string;
};

type ProfileDropdownProps = {
  trigger: ReactNode;
  links: ProfileDropdownLink[];
  side?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  contentClassName?: string;
  linkState?: any;
  getIsActive?: (
    link: ProfileDropdownLink,
    isActiveByRouter: boolean,
  ) => boolean;
  onItemClick?: () => void;
};

export function ProfileDropdown({
  trigger,
  links,
  side = 'bottom',
  align = 'end',
  sideOffset = 16,
  open,
  onOpenChange,
  contentClassName,
  linkState,
  getIsActive,
  onItemClick,
}: ProfileDropdownProps) {
  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild className={cn('group rounded-[20px]')}>
        {trigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className={cn(
          'w-[244px] rounded-3xl border border-zinc-100 bg-white p-1.5 text-white shadow-lg shadow-black/[.03] outline-none xs:w-[178px]',
          contentClassName,
        )}
        side={side}
        sideOffset={sideOffset}
        align={align}
      >
        <ul className="flex flex-col gap-1.5">
          {links.map((link, i) => {
            const isLogout =
              link.to === '/logout' || /log\s*out/i.test(link.name);
            const Icon = link.icon as any;

            return (
              <NavLink
                key={i}
                to={link.to}
                data-testid={link.testid}
                state={linkState}
                target={link.to.includes('https') ? '_blank' : undefined}
                rel={
                  link.to.includes('https') ? 'noopener noreferrer' : undefined
                }
                onClick={onItemClick}
                className={({ isActive }) => {
                  const shouldBeActive = getIsActive
                    ? getIsActive(link, isActive)
                    : isActive;

                  return cn(
                    isLogout
                      ? 'flex cursor-pointer items-center gap-3 rounded-[18px] p-4 text-secondary transition duration-200 ease-in-out hover:text-zinc-600'
                      : 'flex cursor-pointer items-center gap-3 rounded-[18px] border border-transparent p-4 text-secondary transition duration-200 ease-in-out hover:text-zinc-600',
                    shouldBeActive &&
                      !isLogout &&
                      'border-zinc-200 bg-white text-zinc-900 shadow-sm',
                  );
                }}
              >
                <Icon width={12} height={12} color="currentColor" />
                <p className="text-sm">{link.name}</p>
              </NavLink>
            );
          })}
        </ul>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ProfileDropdown;
