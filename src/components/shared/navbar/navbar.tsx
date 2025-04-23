import { ChevronDown, Ellipsis, LogOut, LucideIcon } from 'lucide-react';
import React, { FC, SVGProps, useMemo, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';

import {
  DataIcon,
  HomeIcon,
  LockIcon,
  MarketplaceIcon,
  MessageIcon,
  ServicesIcon,
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
import { useBlur } from '@/hooks/use-blur';
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
  { icon: ServicesIcon, name: 'Services', to: './services' },
];

export const Navbar = () => {
  return (
    <>
      <DesktopNavbar />
      <MobileNavbar />
    </>
  );
};

export const DesktopNavbar = () => {
  const { checkAccess } = useAuthorization();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isHomePage = pathname === '/';

  const isBlurred = useBlur({ blurAfter: isHomePage ? 621 : 10 });

  const protectedLinks: Link[] = [
    checkAccess({ allowedRoles: [ROLES.SUPER_ADMIN] }) && {
      name: 'Users',
      to: './users',
      icon: LockIcon,
    },
  ].filter(Boolean) as Link[];

  const dropdownItems = useMemo(
    () => [
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
    ],
    [],
  );

  const allLinks = useMemo(
    () => [...baseLinks, ...protectedLinks],
    [protectedLinks],
  );

  // Helper to handle clicks:
  // If the URL is external, open a new tab; if not, scroll to top.
  const handleLinkClick = (url: string) => {
    if (url.includes('https')) {
      window.open(url, '_blank', 'noreferrer');
    } else {
      // For internal navigation, scroll to top after navigation.
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <nav
      className={cn(
        'sticky top-0 z-[49] hidden w-full px-4 lg:block transition-colors duration-200',
        isBlurred
          ? 'bg-opacity-10 bg-white backdrop-blur-sm rounded-b-2xl'
          : null,
      )}
    >
      <div
        className={cn(
          'mx-auto flex w-full items-center justify-between gap-2 lg:gap-8 py-3',
          allLinks.length <= baseLinks.length ? 'max-w-6xl' : 'max-w-[1600px]',
        )}
      >
        <div className="flex flex-1">
          <NavLink
            to="/"
            onClick={() => handleLinkClick('/')}
            className={({ isActive }) =>
              cn(
                'self-start transition-colors duration-150',
                isHomePage
                  ? isBlurred
                    ? 'text-black hover:text-secondary'
                    : 'text-white'
                  : isActive
                    ? 'text-white'
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
                onClick={() => handleLinkClick(link.to)}
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
          <div className="flex items-center justify-end gap-4">
            <NavLink
              to="https://products.superpower.com/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                handleLinkClick('https://products.superpower.com/')
              }
              className={({ isActive }) =>
                cn(
                  'group relative z-10 px-4 py-1.5 transition-all duration-150',
                  isHomePage
                    ? isBlurred
                      ? 'text-secondary hover:text-black'
                      : 'text-white'
                    : isActive
                      ? 'text-white'
                      : 'text-secondary hover:text-black',
                )
              }
            >
              <MarketplaceIcon className="mb-1 w-[18px]" />
            </NavLink>
            <NavLink
              to="./invite"
              onClick={() => handleLinkClick('./invite')}
              className={({ isActive }) =>
                cn(
                  'group relative z-10 truncate px-4 py-1.5 transition-all duration-150',
                  isHomePage
                    ? isBlurred
                      ? 'text-secondary hover:text-black'
                      : 'text-white'
                    : isActive
                      ? 'text-black hover:text-secondary'
                      : 'text-secondary hover:text-black',
                )
              }
            >
              <span className="truncate">Invite Friend</span>
            </NavLink>
            <DropdownMenu>
              <DropdownMenuTrigger
                asChild
                data-testid="user-menu-trigger"
                className="group rounded-full outline outline-1 outline-transparent transition-all duration-150 data-[state=open]:outline-2"
              >
                <button
                  className={cn(
                    'border-0 bg-transparent p-0 focus:outline-none flex items-center gap-1.5',
                    isHomePage
                      ? isBlurred
                        ? 'text-secondary hover:text-black'
                        : 'text-white'
                      : 'text-secondary hover:text-black',
                  )}
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
                {dropdownItems.map((item) => (
                  <DropdownMenuItem
                    key={item.name}
                    onClick={() => {
                      if (item.to.includes('https')) {
                        handleLinkClick(item.to);
                      } else {
                        handleLinkClick(item.to);
                        navigate(item.to);
                      }
                    }}
                    data-testid={item.testid}
                    className="flex items-center gap-2"
                  >
                    <item.icon width={14} height={14} />
                    <p className="text-sm font-medium">{item.name}</p>
                  </DropdownMenuItem>
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
      icon: MarketplaceIcon,
      name: 'Marketplace',
      to: 'https://products.superpower.com',
    },
    {
      icon: SettingsIcon,
      name: 'Settings',
      to: './settings',
    },
    invite,
    ...protectedLinks,
  ];

  const handleLinkClick = (url: string) => {
    if (url.includes('https')) {
      window.open(url, '_blank', 'noreferrer');
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      <div
        className={cn(
          'flex justify-between lg:hidden items-center w-full p-4 fixed bottom-0 bg-white border-t border-t-zinc-100 z-10 h-[72px]',
        )}
      >
        {baseLinks.map((link, idx) => (
          <NavLink
            key={idx}
            to={link.to}
            end
            target={link.to.includes('https') ? '_blank' : undefined}
            rel={link.to.includes('https') ? 'noopener noreferrer' : undefined}
            onClick={() => handleLinkClick(link.to)}
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
              {additionalMobileLinks.map((link, i) =>
                link.to.includes('https') ? (
                  <DropdownMenuItem
                    key={i}
                    className="cursor-pointer rounded-[18px] p-4 transition duration-200 ease-in-out focus:bg-[#252525]"
                    onClick={() => {
                      handleLinkClick(link.to);
                      setOpen(false);
                    }}
                  >
                    <div className="flex flex-1 items-center gap-3">
                      <link.icon width={12} height={12} color="white" />
                      <p className="text-sm text-white">{link.name}</p>
                    </div>
                  </DropdownMenuItem>
                ) : (
                  <NavLink
                    key={i}
                    to={link.to}
                    onClick={() => {
                      handleLinkClick(link.to);
                      setOpen(false);
                    }}
                    className={({ isActive }) =>
                      cn(
                        'flex cursor-pointer items-center gap-3 rounded-[18px] p-4 transition duration-200 ease-in-out hover:bg-[#252525]',
                        isActive && 'bg-[#252525]',
                      )
                    }
                  >
                    <link.icon width={12} height={12} color="white" />
                    <p className="text-sm text-white">{link.name}</p>
                  </NavLink>
                ),
              )}
              <NavLink
                to="/logout"
                onClick={() => {
                  handleLinkClick('/logout');
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
