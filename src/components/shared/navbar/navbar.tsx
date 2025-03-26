import { motion } from 'framer-motion';
import { ChevronDown, Ellipsis, LogOut, LucideIcon } from 'lucide-react';
import React, {
  FC,
  SVGProps,
  useEffect,
  useState,
  useMemo,
  useRef,
} from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';

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
  {
    icon: DataIcon,
    name: 'Data',
    to: './data',
  },
  {
    icon: MessageIcon,
    name: 'Concierge',
    to: './concierge',
  },
  {
    icon: ServicesIcon,
    name: 'Services',
    to: './services',
  },
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
  const location = useLocation();
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const navLinkRefs = React.useRef<(HTMLAnchorElement | null)[]>([]);
  const [isReversed, setIsReversed] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const protectedLinks: Link[] = [
    checkAccess({ allowedRoles: [ROLES.SUPER_ADMIN] }) && {
      name: 'Users',
      to: './users',
      icon: LockIcon,
    },
  ].filter(Boolean) as Link[];

  const dropdownItems = useMemo(() => {
    return [
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
  }, []);

  const allLinks = useMemo(
    () => [...baseLinks, ...protectedLinks],

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [baseLinks, protectedLinks],
  );

  useEffect(() => {
    const newActiveIndex = allLinks.findIndex((link) => {
      const path = link.to.startsWith('./')
        ? link.to.replace('./', '/')
        : link.to;

      return (
        location.pathname.endsWith(path) ||
        location.pathname === `/${path}` ||
        (link.to === './' &&
          (location.pathname === '/' || location.pathname === ''))
      );
    });

    setActiveIndex(newActiveIndex);
  }, [location.pathname, allLinks]);

  useEffect(() => {
    // Set up intersection observer to watch for nav-reverse element
    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsReversed(true);
        } else {
          setIsReversed(false);
        }
      });
    };

    observerRef.current = new IntersectionObserver(observerCallback, {
      threshold: 0.125, // Trigger when at least 10% of the target is visible
    });

    // Find the element with id="nav-reverse"
    const targetElement = document.getElementById('nav-reverse');
    if (targetElement) {
      observerRef.current.observe(targetElement);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname === '/') {
      setIsReversed(true);
    } else {
      setIsReversed(false);
    }
  }, [location.pathname]);

  const handleLinkClick = (url: string) => {
    if (url.includes('https')) {
      // Open external link in a new tab with noreferrer for security
      window.open(url, '_blank', 'noreferrer');
    } else {
      // Navigate internally using react-router's navigate function
      navigate(url);

      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <nav
      className={cn(
        'sticky top-0 z-[49] md:-mb-24 hidden w-full px-4 md:block transition-colors duration-200',
        isReversed
          ? 'bg-gradient-to-b from-black/30 via-black/20 via-50% to-black/0'
          : 'bg-gradient-to-b from-zinc-50 via-zinc-50/75 via-50% to-zinc-50/0',
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
            className={cn(
              'self-start transition-colors duration-150',
              isReversed
                ? 'text-white hover:text-white/75'
                : 'hover:text-secondary text-black',
            )}
          >
            <SuperpowerLogo fill="currentColor" className="w-32" />
          </NavLink>
        </div>
        <div className="relative flex flex-1 items-center justify-center">
          <div className="relative flex items-center justify-center rounded-full bg-black p-1 shadow-xl shadow-black/5 transition-all duration-200 lg:gap-2">
            {activeIndex >= 0 && navLinkRefs.current[activeIndex] && (
              <motion.div
                className="absolute left-0 z-0 h-9 rounded-full bg-zinc-800 transition-colors duration-200"
                initial={{
                  width: navLinkRefs.current[activeIndex]?.offsetWidth ?? 0,
                  x: navLinkRefs.current[activeIndex]?.offsetLeft ?? 0,
                  opacity: 1,
                }}
                animate={{
                  width: navLinkRefs.current[activeIndex]?.offsetWidth ?? 0,
                  x: navLinkRefs.current[activeIndex]?.offsetLeft ?? 0,
                  opacity: activeIndex >= 0 ? 1 : 0,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 225,
                  damping: 25,
                  speed: 0.2,
                }}
              />
            )}

            {allLinks.map((link, idx) => (
              <NavLink
                key={idx}
                ref={(el) => (navLinkRefs.current[idx] = el)}
                to={link.to}
                onClick={() => handleLinkClick(link.to)}
                className={cn(
                  'group relative z-10 truncate px-4 py-1.5 transition-all duration-150 active:scale-[98%]',
                  activeIndex === idx && navLinkRefs.current[idx]
                    ? 'text-white'
                    : 'text-secondary hover:text-secondary/75',
                )}
              >
                <div className="relative truncate">
                  <span className="truncate">{link.name}</span>
                </div>
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
              className={cn(
                'group relative z-10 px-4 py-1.5 transition-all duration-150 active:scale-[98%]',
                isReversed
                  ? 'text-white hover:text-white/75'
                  : 'text-secondary hover:text-black',
              )}
            >
              <MarketplaceIcon className="w-[18px] mb-1" />
            </NavLink>
            <NavLink
              to="./invite"
              className={cn(
                'group relative z-10 truncate px-4 py-1.5 transition-all duration-150 active:scale-[98%]',
                isReversed
                  ? 'text-white hover:text-white/75'
                  : 'text-secondary hover:text-black',
              )}
            >
              <span className="truncate">Invite Friend</span>
            </NavLink>
            <DropdownMenu>
              <DropdownMenuTrigger
                asChild
                data-testid="user-menu-trigger"
                className="rounded-full group outline outline-1 outline-transparent transition-all duration-150 data-[state=open]:outline-2"
              >
                <button
                  className={cn(
                    'border-0 bg-transparent p-0 focus:outline-none flex items-center gap-1.5',
                    isReversed
                      ? 'text-white hover:text-white/75'
                      : 'text-secondary hover:text-black',
                  )}
                >
                  More
                  <ChevronDown className="w-4 h-4 group-data-[state=open]:rotate-180 transition-transform duration-200" />
                </button>
                {/* todo: exchange "More" with avatar as soon as implemented
                <button className="border-0 bg-transparent p-0 focus:outline-none">
                  <Avatar size="sm" />
                </button> */}
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="rounded-2xl"
                align="end"
                sideOffset={5}
              >
                {dropdownItems.map((item) => (
                  <DropdownMenuItem
                    key={item.name}
                    onClick={() => handleLinkClick(item.to)}
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
  const [activeIndex, setActiveIndex] = useState(0);
  const location = useLocation();
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

  useEffect(() => {
    const newActiveIndex = baseLinks.findIndex((link) => {
      const path = link.to.startsWith('./')
        ? link.to.replace('./', '/')
        : link.to;

      return (
        location.pathname.endsWith(path) ||
        location.pathname === `/${path}` ||
        (link.to === './' &&
          (location.pathname === '/' || location.pathname === ''))
      );
    });

    setActiveIndex(newActiveIndex);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, baseLinks]);

  const navigate = useNavigate();

  const handleLinkClick = (url: string) => {
    if (url.includes('https')) {
      // Open external link in a new tab with noreferrer for security
      window.open(url, '_blank', 'noreferrer');
    } else {
      // Navigate internally using react-router's navigate function
      navigate(url);

      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      <div
        className={cn(
          'flex justify-between md:hidden items-center w-full p-4 fixed bottom-0 bg-white border-t border-t-zinc-100 z-10 h-[72px]',
        )}
      >
        {baseLinks.map((link, idx) => (
          <NavLink
            key={idx}
            to={link.to}
            target={link.to.includes('https') ? '_blank' : undefined}
            rel={link.to.includes('https') ? 'noopener noreferrer' : undefined}
            end
            onClick={() => handleLinkClick(link.to)}
            className={[
              activeIndex === idx ? 'bg-zinc-100' : 'group/sidebar',
              'flex transition-colors rounded-xl flex-col md:flex-row items-center gap-2 p-2 min-w-[62px] md:min-w-0 md:p-4 cursor-pointer hover:bg-zinc-100',
            ].join(' ')}
          >
            <>
              <link.icon
                className={cn(
                  'min-w-5 h-5 text-zinc-400 group-hover/sidebar:text-zinc-500 transition duration-150',
                  activeIndex === idx ? 'text-zinc-900' : null,
                )}
              />

              <span
                className={cn(
                  '!m-0 inline-block whitespace-pre !p-0 text-[10px] md:text-sm text-zinc-500 transition duration-150',
                  activeIndex === idx ? 'text-zinc-900 md:translate-x-1' : null,
                )}
              >
                {link.name}
              </span>

              {!open && activeIndex === idx && (
                <div className="absolute -bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full bg-zinc-900 md:hidden" />
              )}
            </>
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
                    className={({ isActive }) =>
                      cn(
                        'flex cursor-pointer items-center gap-3 rounded-[18px] p-4 transition duration-200 ease-in-out hover:bg-[#252525]',
                        isActive && 'bg-[#252525]',
                      )
                    }
                    onClick={() => setOpen(false)}
                  >
                    <link.icon width={12} height={12} color="white" />
                    <p className="text-sm text-white">{link.name}</p>
                  </NavLink>
                ),
              )}
              <NavLink
                to="/logout"
                className="flex cursor-pointer items-center gap-3 rounded-[18px] p-4 transition duration-200 ease-in-out hover:bg-[#252525]"
                onClick={() => setOpen(false)}
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
