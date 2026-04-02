import { Link, useLocation } from '@tanstack/react-router';
import {
  ChevronDown,
  Ellipsis,
  LogOut,
  LucideIcon,
  Package,
} from 'lucide-react';
import { FC, SVGProps, useEffect, useMemo, useState } from 'react';

import {
  DataIcon,
  HomeIcon,
  LockIcon,
  MarketplaceIcon,
  MessageIcon,
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
import { useAnalytics } from '@/hooks/use-analytics';
import { useScrollThreshold } from '@/hooks/use-scroll-threshold';
import { useStopImpersonating, useUser } from '@/lib/auth';
import { ROLES, useAuthorization } from '@/lib/authorization';
import { cn } from '@/lib/utils';

type NavItem = {
  name: string;
  to: string;
  icon: LucideIcon | FC<SVGProps<SVGSVGElement>>;
  theme?: 'light' | 'dark';
};

const baseLinks: NavItem[] = [
  { icon: HomeIcon, name: 'Home', to: '/' },
  { icon: DataIcon, name: 'Data', to: '/data' },
  { icon: PlansIcon, name: 'Protocol', to: '/protocol' },
  { icon: MessageIcon, name: 'Concierge', to: '/concierge' },
  { icon: MarketplaceIcon, name: 'Marketplace', to: '/marketplace' },
];

const profileDropdownItems = [
  {
    name: 'Settings',
    to: '/settings',
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

  const hideNavbarPaths = [
    '/protocol/reveal/',
    '/family-risk/plan',
    // todo: change this path
    '/protocol/dev',
  ];

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
  const { track } = useAnalytics();
  const user = useUser();
  const stopImpersonating = useStopImpersonating();
  const isImpersonating = !!user.data?.adminActor;

  const isLight = lightNavPaths.includes(pathname);
  const isBlurred = useScrollThreshold({
    thresholdPx: blurThresholds[pathname] || 10,
  });

  const protectedLinks: NavItem[] = [
    checkAccess({ allowedRoles: [ROLES.SUPER_ADMIN] }) && {
      name: 'Users',
      to: '/users',
      icon: LockIcon,
    },
  ].filter(Boolean) as NavItem[];

  const allLinks = useMemo(
    () => [...baseLinks, ...protectedLinks],
    [protectedLinks],
  );

  /* This is a hack because the sizes differ on different routes
     This should be refactored asap */

  return (
    <nav
      className={cn(
        'sticky top-0 z-[49] hidden w-full transition-colors duration-200 lg:block',
        isBlurred
          ? 'rounded-b-2xl bg-white bg-opacity-10 backdrop-blur-sm'
          : null,
      )}
    >
      <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-2 px-16 py-3 lg:gap-8">
        <div className="flex flex-1">
          <Link
            to="/"
            className={cn(
              'self-start transition-colors duration-150',
              isLight
                ? isBlurred
                  ? 'text-black hover:text-secondary'
                  : 'text-white'
                : 'text-black hover:text-secondary',
            )}
          >
            <SuperpowerLogo fill="currentColor" className="w-32" />
          </Link>
        </div>
        <div className="relative flex flex-1 items-center justify-center">
          <div className="relative flex items-center justify-center rounded-full bg-black p-1 shadow-xl shadow-black/5 transition-all duration-200 lg:gap-2">
            {allLinks.map((link) => (
              <Link
                key={link.name}
                to={link.to}
                activeOptions={{ exact: link.to === '/' }}
                onClick={() => {
                  if (link.name === 'Marketplace') {
                    track('click_marketplace_button');
                  }
                }}
                className="group relative z-10 truncate px-4 py-1.5 text-secondary transition-all duration-150 hover:text-secondary/75 active:scale-[98%]"
                activeProps={{
                  className:
                    'rounded-full bg-primary text-white hover:text-white',
                }}
              >
                <span className="truncate">{link.name}</span>
              </Link>
            ))}
          </div>
        </div>
        <div className="h-10 flex-1">
          <div className="flex items-center justify-end">
            <Link
              to="/invite"
              className={cn(
                'group relative z-10 truncate px-4 py-1.5 transition-all duration-150',
                isLight && !isBlurred
                  ? 'text-white'
                  : 'text-black hover:text-secondary',
              )}
            >
              <span className="truncate">Invite Friend</span>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger
                asChild
                className="group rounded-full outline outline-1 outline-transparent transition-all duration-150 data-[state=open]:outline-2"
              >
                <button
                  className={cn(
                    'flex items-center gap-1.5 border-0 bg-transparent px-4 focus:outline-none',
                    isLight
                      ? isBlurred
                        ? 'text-black hover:text-secondary'
                        : 'text-white'
                      : 'text-black hover:text-secondary',
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
                {isImpersonating && (
                  <DropdownMenuItem
                    className="w-full gap-3 rounded-[10px] p-4"
                    onClick={() => stopImpersonating.mutate()}
                  >
                    <LogOut width={14} height={14} />
                    <p className="text-sm">Stop Impersonating</p>
                  </DropdownMenuItem>
                )}
                {profileDropdownItems.map((link) => (
                  <Link
                    key={link.name}
                    to={link.to}
                    data-testid={link.testid}
                    className="flex cursor-pointer items-center gap-3 rounded-[10px] transition duration-200 ease-in-out"
                    activeProps={{ className: 'bg-accent' }}
                  >
                    <DropdownMenuItem className="w-full gap-3 rounded-[10px] p-4">
                      <link.icon width={14} height={14} />
                      <p className="text-sm">{link.name}</p>
                    </DropdownMenuItem>
                  </Link>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
};

const MobileNavLink = ({
  to,
  onClick,
  children,
  className,
}: {
  to: string;
  onClick?: () => void;
  children: (props: { isActive: boolean }) => React.ReactNode;
  className?: string;
}) => {
  const { pathname } = useLocation();
  const isActive = to === '/' ? pathname === '/' : pathname.startsWith(to);

  return (
    <Link to={to} onClick={onClick} className={className}>
      {children({ isActive })}
    </Link>
  );
};

export const MobileNavbar = () => {
  const { checkAccess } = useAuthorization();
  const [open, setOpen] = useState(false);
  const { pathname, searchStr } = useLocation();
  const { track } = useAnalytics();
  const user = useUser();
  const stopImpersonating = useStopImpersonating();
  const isImpersonating = !!user.data?.adminActor;
  const searchParams = useMemo(
    () => new URLSearchParams(searchStr),
    [searchStr],
  );
  const isMarketplaceOrdersActive =
    pathname === '/marketplace' && searchParams.get('tab') === 'orders';

  const protectedLinks: NavItem[] = [
    checkAccess({ allowedRoles: [ROLES.SUPER_ADMIN] }) && {
      name: 'Users',
      to: '/users',
      icon: LockIcon,
    },
  ].filter(Boolean) as NavItem[];

  const invite: NavItem = {
    name: 'Invite friend',
    to: '/invite',
    icon: PresentIcon,
  };

  const additionalMobileLinks: NavItem[] = [
    {
      icon: Package,
      name: 'Your Orders',
      to: '/orders',
    },
    {
      icon: SettingsIcon,
      name: 'Settings',
      to: '/settings',
    },
    invite,
    ...protectedLinks,
  ];

  return (
    <div className="fixed inset-x-3 bottom-3 z-[51] flex h-16 items-center gap-2 lg:hidden">
      <div
        className={cn(
          'flex h-full flex-1 items-center justify-between rounded-3xl border border-zinc-100 bg-white px-1 shadow-lg shadow-black/[.03]',
        )}
      >
        {baseLinks
          .filter((link) => link.name !== 'Concierge')
          .map((link, idx) => (
            <MobileNavLink
              key={idx}
              to={link.to}
              onClick={() => {
                if (link.name === 'Marketplace') {
                  track('click_marketplace_button');
                }
              }}
              className={cn(
                'group flex aspect-square h-[calc(100%-0.5rem)] shrink-0 cursor-pointer flex-col items-center justify-center gap-2 rounded-[20px] p-4 transition-colors md:min-w-0 md:flex-row',
              )}
            >
              {({ isActive }) => (
                <link.icon
                  fill="currentColor"
                  className={cn(
                    'h-5 min-w-5 transition duration-150',
                    isActive
                      ? 'text-zinc-900'
                      : 'text-zinc-300 group-hover:text-secondary',
                  )}
                />
              )}
            </MobileNavLink>
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
            link.to === '/marketplace' ? isMarketplaceOrdersActive : isActive
          }
          actions={
            isImpersonating
              ? [
                  {
                    name: 'Stop Impersonating',
                    icon: LogOut,
                    onClick: () => stopImpersonating.mutate(),
                  },
                ]
              : undefined
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
        <Link
          to="/concierge"
          className="group flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-[20px] p-4 transition-colors md:min-w-0 md:flex-row"
        >
          {({ isActive }) => (
            <CircleAiIcon
              size={32}
              className={cn(
                'shrink-0 transition-colors',
                isActive
                  ? 'text-vermillion-900'
                  : 'text-zinc-300 group-hover:text-secondary',
              )}
            />
          )}
        </Link>
      </div>
    </div>
  );
};
