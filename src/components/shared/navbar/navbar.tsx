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
import { CircleAiIcon } from '@/components/icons/circle-ai-icon';
import { PlansIcon } from '@/components/icons/plans-icon';
import { PresentIcon } from '@/components/icons/present-icon';
import { SettingsIcon } from '@/components/icons/settings-icon';
import { SuperpowerLogo } from '@/components/icons/superpower-logo';
import { ProfileDropdown } from '@/components/shared/profile-dropdown';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown';
// eslint-disable-next-line import/no-restricted-paths
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
  { icon: PlansIcon, name: 'Protocol', to: './protocol' },
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

  const hideNavbarPaths = [`/protocol/reveal/`];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  if (hideNavbarPaths.some((url) => pathname.startsWith(url))) return null;

  return (
    <>
      <DesktopNavbar />
      <MobileNavbar />
    </>
  );
};

const lightNavPaths = [
  '/invite',
  '/protocol/reveal/get-started',
  '/protocol/reveal/biological-age',
  '/protocol/reveal/score',
];
const blurThresholds: Record<string, number> = {
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
                        'flex cursor-pointer items-center gap-3 transition duration-200 ease-in-out rounded-[10px]',
                        isActive && 'bg-accent',
                      )
                    }
                  >
                    <DropdownMenuItem className="w-full gap-3 rounded-[10px] p-4">
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
    <div className="fixed inset-x-3 bottom-3 z-[51] flex h-16 items-center gap-2 lg:hidden">
      <div
        className={cn(
          'flex flex-1 justify-between items-center h-full px-1 rounded-3xl bg-white border border-zinc-100 shadow-lg shadow-black/[.03]',
        )}
      >
        {baseLinks
          .filter((link) => link.name !== 'Concierge')
          .map((link, idx) => (
            <NavLink
              key={idx}
              to={link.to}
              className={cn(
                'flex justify-center group shrink-0 h-[calc(100%-0.5rem)] transition-colors rounded-[20px] flex-col md:flex-row items-center gap-2 aspect-square p-4 md:min-w-0 cursor-pointer',
              )}
            >
              {({ isActive }) => (
                <link.icon
                  fill="currentColor"
                  className={cn(
                    'min-w-5 h-5 transition duration-150',
                    isActive
                      ? 'text-zinc-900'
                      : 'text-zinc-300 group-hover:text-secondary',
                  )}
                />
              )}
            </NavLink>
          ))}
        <ProfileDropdown
          open={open}
          onOpenChange={setOpen}
          side="bottom"
          sideOffset={16}
          align="end"
          linkState={{ from: pathname }}
          onItemClick={() => setOpen(false)}
          getIsActive={(link, isActive) =>
            link.to === '/marketplace?tab=orders'
              ? isMarketplaceOrdersActive
              : isActive
          }
          links={[
            ...additionalMobileLinks,
            { name: 'Log out', to: '/logout', icon: LogOut },
          ]}
          trigger={
            <Button
              variant="link"
              className="group p-[14px] focus-visible:ring-transparent focus-visible:ring-offset-0 sm:px-4"
            >
              <Ellipsis className="text-zinc-300 transition-colors group-hover:text-secondary group-data-[state='open']:text-zinc-900" />
            </Button>
          }
        />
      </div>
      <div className="flex aspect-square h-full shrink-0 items-center justify-center rounded-3xl border border-zinc-100 bg-white shadow-lg shadow-black/[.03]">
        <NavLink
          to={'./concierge'}
          className={cn(
            'flex justify-center rounded-[20px] group transition-colors flex-col md:flex-row items-center gap-2 aspect-square p-4 md:min-w-0 cursor-pointer',
          )}
        >
          <CircleAiIcon
            size={32}
            className={cn(
              'shrink-0 transition-colors',
              pathname.startsWith('/concierge')
                ? 'text-zinc-900'
                : 'text-zinc-300 group-hover:text-secondary',
            )}
          />
        </NavLink>
      </div>
    </div>
  );
};
