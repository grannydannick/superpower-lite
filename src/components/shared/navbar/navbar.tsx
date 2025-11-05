import {
  ChevronDown,
  Ellipsis,
  LogOut,
  LucideIcon,
  Package,
} from 'lucide-react';
import { FC, SVGProps, useEffect, useMemo, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

import {
  DataIcon,
  HomeIcon,
  LockIcon,
  MessageIcon,
  MarketplaceIcon,
} from '@/components/icons';
import { PresentIcon } from '@/components/icons/present-icon';
import { SettingsIcon } from '@/components/icons/settings-icon';
import { SuperpowerLogo } from '@/components/icons/superpower-logo';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown';
import { useScrollThreshold } from '@/hooks/use-scroll-threshold';
import { ROLES, useAuthorization } from '@/lib/authorization';
import { cn } from '@/lib/utils';

type Link = {
  name: string;
  to: string;
  icon: LucideIcon | FC<SVGProps<SVGSVGElement>>;
  theme?: 'light' | 'dark';
};

const baseLinks: Link[] = [
  { icon: HomeIcon, name: 'Home', to: './' },
  { icon: DataIcon, name: 'Data', to: './data' },
  { icon: MessageIcon, name: 'Concierge', to: './concierge' },
  { icon: MarketplaceIcon, name: 'Marketplace', to: './marketplace' },
];

const profileDropdownItems = [
  {
    name: 'Settings',
    to: './settings',
    icon: SettingsIcon,
  },
  {
    name: 'Log out',
    to: '/logout',
    icon: LogOut,
    testid: 'logout-btn-desktop',
  },
];

export const Navbar = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  return (
    <>
      <DesktopNavbar />
      <MobileNavbar />
    </>
  );
};

const lightNavPaths = ['/', '/invite'];
const blurThresholds: Record<string, number> = {
  '/': 621,
  '/invite': 500,
};

export const DesktopNavbar = () => {
  const { checkAccess } = useAuthorization();
  const { pathname } = useLocation();

  const isLight = lightNavPaths.includes(pathname);
  const isBlurred = useScrollThreshold({
    thresholdPx: blurThresholds[pathname] || 10,
  });

  const protectedLinks: Link[] = [
    checkAccess({ allowedRoles: [ROLES.SUPER_ADMIN] }) && {
      name: 'Users',
      to: './users',
      icon: LockIcon,
    },
  ].filter(Boolean) as Link[];

  const allLinks = useMemo(
    () => [...baseLinks, ...protectedLinks],
    [protectedLinks],
  );

  /* This is a hack because the sizes differ on different routes
     This should be refactored asap */

  return (
    <nav
      className={cn(
        'sticky top-0 z-[49] hidden w-full lg:block transition-colors duration-200',
        isBlurred
          ? 'bg-opacity-10 bg-white backdrop-blur-sm rounded-b-2xl'
          : null,
      )}
    >
      <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-2 px-16 py-3 lg:gap-8">
        <div className="flex flex-1">
          <NavLink
            to="/"
            className={() =>
              cn(
                'self-start transition-colors duration-150',
                isLight
                  ? isBlurred
                    ? 'text-black hover:text-secondary'
                    : 'text-white'
                  : 'text-black hover:text-secondary',
              )
            }
          >
            <SuperpowerLogo fill="currentColor" className="w-32" />
          </NavLink>
        </div>
        <div className="relative flex flex-1 items-center justify-center">
          <div className="relative flex items-center justify-center rounded-full bg-black p-1 shadow-xl shadow-black/5 transition-all duration-200 lg:gap-2">
            {allLinks.map((link, idx) => (
              <NavLink
                key={idx}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    'group relative z-10 truncate px-4 py-1.5 transition-all duration-150 active:scale-[98%]',
                    isActive
                      ? 'text-white bg-primary rounded-full'
                      : 'text-secondary hover:text-secondary/75',
                  )
                }
              >
                <span className="truncate">{link.name}</span>
              </NavLink>
            ))}
          </div>
        </div>
        <div className="h-10 flex-1">
          <div className="flex items-center justify-end">
            <NavLink
              to="./invite"
              className={({ isActive }) =>
                cn(
                  'group relative z-10 truncate px-4 py-1.5 transition-all duration-150',
                  isLight
                    ? isBlurred
                      ? 'hover:text-secondary text-black'
                      : 'text-white'
                    : isActive
                      ? 'text-black hover:text-secondary'
                      : 'hover:text-secondary text-black',
                )
              }
            >
              <span className="truncate">Invite Friend</span>
            </NavLink>

            <DropdownMenu>
              <DropdownMenuTrigger
                asChild
                className="group rounded-full outline outline-1 outline-transparent transition-all duration-150 data-[state=open]:outline-2"
              >
                <button
                  className={cn(
                    'border-0 bg-transparent px-4 focus:outline-none flex items-center gap-1.5',
                    isLight
                      ? isBlurred
                        ? 'hover:text-secondary text-black'
                        : 'text-white'
                      : 'hover:text-secondary text-black',
                  )}
                  data-testid="navbar-more-btn"
                >
                  More
                  <ChevronDown className="size-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="rounded-2xl"
                align="end"
                sideOffset={5}
              >
                {profileDropdownItems.map((link, i) => (
                  <NavLink
                    key={i}
                    to={link.to}
                    data-testid={link.testid}
                    className={({ isActive }) =>
                      cn(
                        'flex cursor-pointer items-center gap-3 transition duration-200 ease-in-out rounded-[18px]',
                        isActive && 'bg-accent',
                      )
                    }
                  >
                    <DropdownMenuItem className="w-full gap-3 rounded-[18px] p-4">
                      <link.icon width={14} height={14} />
                      <p className="text-sm">{link.name}</p>
                    </DropdownMenuItem>
                  </NavLink>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
};

export const MobileNavbar = () => {
  const { checkAccess } = useAuthorization();
  const [open, setOpen] = useState(false);
  const { pathname, search } = useLocation();
  const searchParams = useMemo(() => new URLSearchParams(search), [search]);
  const isMarketplaceOrdersActive =
    pathname === '/marketplace' && searchParams.get('tab') === 'orders';

  const protectedLinks: Link[] = [
    checkAccess({ allowedRoles: [ROLES.SUPER_ADMIN] }) && {
      name: 'Users',
      to: './users',
      icon: LockIcon,
    },
  ].filter(Boolean) as Link[];

  const invite: Link = {
    name: 'Invite friend',
    to: './invite',
    icon: PresentIcon,
  };

  const additionalMobileLinks: Link[] = [
    {
      icon: Package,
      name: 'Your Orders',
      to: '/marketplace?tab=orders',
    },
    {
      icon: SettingsIcon,
      name: 'Settings',
      to: './settings',
    },
    invite,
    ...protectedLinks,
  ];

  return (
    <>
      <div
        className={cn(
          'flex justify-between lg:hidden items-center w-full p-4 fixed bottom-0 bg-white border-t border-t-zinc-100 z-[51] h-[72px]',
        )}
      >
        {baseLinks.map((link, idx) => (
          <NavLink
            key={idx}
            to={link.to}
            className={({ isActive }) =>
              cn(
                'flex transition-colors rounded-xl flex-col md:flex-row items-center gap-2 p-2 min-w-[62px] md:min-w-0 md:p-4 cursor-pointer hover:bg-zinc-100',
                isActive ? 'bg-zinc-100' : '',
              )
            }
          >
            <link.icon
              className={cn(
                'min-w-5 h-5 text-zinc-400 group-hover/sidebar:text-zinc-500 transition duration-150',
                ({ isActive }: { isActive: boolean }) =>
                  isActive ? 'text-zinc-900' : '',
              )}
            />
            <span
              className={cn(
                '!m-0 inline-block whitespace-pre !p-0 text-[10px] md:text-sm text-zinc-500 transition duration-150',
                ({ isActive }: { isActive: boolean }) =>
                  isActive ? 'text-zinc-900 md:translate-x-1' : '',
              )}
            >
              {link.name}
            </span>
          </NavLink>
        ))}
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger className="rounded-full" asChild>
            <Button
              variant="link"
              className="px-[14px] py-3 focus-visible:ring-transparent focus-visible:ring-offset-0 sm:px-4"
            >
              <Ellipsis className="text-zinc-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[244px] rounded-3xl border-none bg-black p-1.5 text-white outline-none xs:w-[178px]"
            side="bottom"
            sideOffset={25}
            align="end"
          >
            <ul className="flex flex-col gap-1.5">
              {additionalMobileLinks.map((link, i) => (
                <NavLink
                  key={i}
                  to={link.to}
                  state={{ from: pathname }}
                  target={link.to.includes('https') ? '_blank' : undefined}
                  rel={
                    link.to.includes('https')
                      ? 'noopener noreferrer'
                      : undefined
                  }
                  onClick={() => {
                    setOpen(false);
                  }}
                  className={({ isActive }) => {
                    const isOrdersLink = link.to === '/marketplace?tab=orders';
                    const shouldBeActive = isOrdersLink
                      ? isMarketplaceOrdersActive
                      : isActive;

                    return cn(
                      'flex cursor-pointer items-center gap-3 rounded-[18px] p-4 transition duration-200 ease-in-out hover:bg-[#252525]',
                      shouldBeActive && 'bg-[#252525]',
                    );
                  }}
                >
                  <link.icon width={12} height={12} color="white" />
                  <p className="text-sm text-white">{link.name}</p>
                </NavLink>
              ))}
              <NavLink
                to="/logout"
                onClick={() => {
                  setOpen(false);
                }}
                className="flex cursor-pointer items-center gap-3 rounded-[18px] p-4 transition duration-200 ease-in-out hover:bg-[#252525]"
              >
                <LogOut width={12} height={12} color="white" />
                <p className="text-sm text-white">Log out</p>
              </NavLink>
            </ul>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
};
