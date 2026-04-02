import { Link, useMatchRoute } from '@tanstack/react-router';
import { LucideIcon } from 'lucide-react';
import { FC, ReactNode, SVGProps } from 'react';

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

export type ProfileDropdownAction = {
  name: string;
  icon: LucideIcon | FC<SVGProps<SVGSVGElement>>;
  onClick: () => void;
};

interface ProfileDropdownLinkState {
  from?: string;
}

type ProfileDropdownProps = {
  trigger: ReactNode;
  links: ProfileDropdownLink[];
  actions?: ProfileDropdownAction[];
  side?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  contentClassName?: string;
  linkState?: ProfileDropdownLinkState;
  getIsActive?: (
    link: ProfileDropdownLink,
    isActiveByRouter: boolean,
  ) => boolean;
  onItemClick?: () => void;
};

export function ProfileDropdown({
  trigger,
  links,
  actions,
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
  const matchRoute = useMatchRoute();

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
          {actions?.map((action) => {
            const Icon = action.icon;
            return (
              <li key={action.name}>
                <button
                  onClick={() => {
                    action.onClick();
                    onItemClick?.();
                  }}
                  className="flex w-full cursor-pointer items-center gap-3 rounded-[18px] p-4 text-secondary transition duration-200 ease-in-out hover:text-zinc-600"
                >
                  <Icon width={12} height={12} color="currentColor" />
                  <p className="text-sm">{action.name}</p>
                </button>
              </li>
            );
          })}
          {links.map((link) => {
            const isLogout =
              link.to === '/logout' || /log\s*out/i.test(link.name);
            const isExternal =
              link.to.startsWith('https://') || link.to.startsWith('http://');
            const isActiveByRouter = isExternal
              ? false
              : matchRoute({ to: link.to, fuzzy: true }) !== false;
            const shouldBeActive = getIsActive
              ? getIsActive(link, isActiveByRouter)
              : isActiveByRouter;
            const className = cn(
              isLogout
                ? 'flex cursor-pointer items-center gap-3 rounded-[18px] p-4 text-secondary transition duration-200 ease-in-out hover:text-zinc-600'
                : 'flex cursor-pointer items-center gap-3 rounded-[18px] border border-transparent p-4 text-secondary transition duration-200 ease-in-out hover:text-zinc-600',
              shouldBeActive &&
                !isLogout &&
                'border-zinc-200 bg-white text-zinc-900 shadow-sm',
            );

            const Icon = link.icon;

            return isExternal ? (
              <a
                key={link.to}
                href={link.to}
                data-testid={link.testid}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onItemClick}
                className={className}
              >
                <Icon width={12} height={12} color="currentColor" />
                <p className="text-sm">{link.name}</p>
              </a>
            ) : (
              <Link
                key={link.to}
                to={link.to}
                data-testid={link.testid}
                state={linkState}
                onClick={onItemClick}
                className={className}
              >
                <Icon width={12} height={12} color="currentColor" />
                <p className="text-sm">{link.name}</p>
              </Link>
            );
          })}
        </ul>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ProfileDropdown;
