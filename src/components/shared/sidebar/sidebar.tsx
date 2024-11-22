import { motion } from 'framer-motion';
import {
  CalendarCheck,
  ChevronsLeft,
  ChevronsRight,
  Ellipsis,
  LogIn,
  LogOut,
  LucideIcon,
  PersonStanding,
  Settings,
} from 'lucide-react';
import React, {
  createContext,
  FC,
  SVGProps,
  useContext,
  useState,
} from 'react';
import {
  Link,
  LinkProps,
  NavLink,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import {
  DataIcon,
  HomeIcon,
  LockIcon,
  MarketplaceIcon,
  MessageIcon,
  ServicesIcon,
} from '@/components/icons';
import { PresentIcon } from '@/components/icons/present-icon';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown';
import { Separator } from '@/components/ui/separator';
import { ROLES, useAuthorization } from '@/lib/authorization';
import { cn } from '@/lib/utils';

type Link = {
  name: string;
  to: string;
  icon: LucideIcon | FC<SVGProps<SVGSVGElement>>;
};

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(
  undefined,
);

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

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  open,
  setOpen,
}: {
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen}>
      <DesktopSidebar />
      <MobileSidebar />
    </SidebarProvider>
  );
};

export const DesktopSidebar = () => {
  const { open } = useSidebar();
  const { checkAccess } = useAuthorization();

  const protectedLinks: Link[] = [
    checkAccess({ allowedRoles: [ROLES.RDN_CLINICIAN] }) && {
      name: 'Upcoming',
      to: './upcoming',
      icon: CalendarCheck,
    },
    checkAccess({ allowedRoles: [ROLES.RDN_CLINICIAN] }) && {
      name: 'Your members',
      to: './members',
      icon: PersonStanding,
    },
    checkAccess({ allowedRoles: [ROLES.SUPER_ADMIN] }) && {
      name: 'Users',
      to: './users',
      icon: LockIcon,
    },
    checkAccess({ allowedRoles: [ROLES.SUPER_ADMIN] }) && {
      name: 'RDNs',
      to: './rdns',
      icon: LockIcon,
    },
  ].filter(Boolean) as Link[];

  const desktopLinks: Link[] = [
    ...baseLinks,
    {
      icon: MarketplaceIcon,
      name: 'Marketplace',
      to: 'https://products.superpower.com',
    },
    {
      icon: Settings,
      name: 'Settings',
      to: './settings',
    },
  ];

  const invite: Link = {
    name: 'Invite friend',
    to: './invite',
    icon: PresentIcon,
  };

  return (
    <>
      <motion.div
        className={cn(
          'hidden h-dvh fixed px-4 py-4 md:flex md:flex-col bg-white flex-shrink-0 w-[196px] md:justify-between md:gap-10 border-r border-r-zinc-200',
          open ? 'w-[196px]' : 'w-[88px]',
        )}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="flex overflow-y-auto overflow-x-hidden md:flex-col">
          {open ? <Logo /> : <LogoIcon />}
          <div className="flex w-full justify-between gap-2 md:mt-8 md:flex-col">
            <div className={cn(!protectedLinks.length ? 'hidden' : null)}>
              {protectedLinks.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
              <Separator className="my-2.5" />
            </div>
            {desktopLinks.map((link, idx) => (
              <SidebarLink key={idx} link={link} />
            ))}
          </div>
        </div>
        <div>
          <CollapseButton />
          <Separator className="my-2.5" />
          <div className="space-y-2.5 py-5">
            <SidebarLink link={invite} />
            <LogoutButton />
          </div>
        </div>
      </motion.div>
    </>
  );
};

export const MobileSidebar = () => {
  const additionalMobileLinks: Link[] = [
    {
      icon: MarketplaceIcon,
      name: 'Marketplace',
      to: 'https://products.superpower.com',
    },
    {
      icon: Settings,
      name: 'Settings',
      to: './settings',
    },
    {
      name: 'Invite friend',
      to: './invite',
      icon: PresentIcon,
    },
  ];

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
          <SidebarLink key={idx} link={link} />
        ))}
        <DropdownMenu>
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
                <DropdownMenuItem
                  key={i}
                  className="cursor-pointer rounded-[18px] p-4 transition duration-200 ease-in-out focus:bg-[#252525]"
                  onClick={() => handleLinkClick(link.to)}
                >
                  <div className="flex flex-1 items-center gap-3">
                    <link.icon width={12} height={12} color="white" />

                    <p className="text-sm text-white">{link.name}</p>
                  </div>
                </DropdownMenuItem>
              ))}
              <NavLink
                to="/logout"
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

export const SidebarLink = ({
  link,
  className,
  ...props
}: {
  link: Link;
  className?: string;
  props?: LinkProps;
}) => {
  const { open } = useSidebar();
  const { pathname } = useLocation();
  const isSelected = pathname === link.to;

  const Icon = link.icon;

  const scrollToTop = () => {
    if (link.to.startsWith('https')) {
      return;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <NavLink
      to={link.to}
      target={link.to.includes('https') ? '_blank' : undefined}
      rel={link.to.includes('https') ? 'noopener noreferrer' : undefined}
      end
      onClick={scrollToTop}
      className={({ isActive }) =>
        [
          isActive ? 'bg-zinc-100' : null,
          'flex flex-col md:flex-row items-center gap-2 group/sidebar p-2 min-w-[62px] md:min-w-0 md:p-4 cursor-pointer hover:bg-zinc-100',
          open ? 'justify-start rounded-[52px]' : 'justify-center rounded-full',
          className,
        ].join(' ')
      }
      {...props}
    >
      <Icon
        className={cn(
          'min-w-5 h-5 text-zinc-400',
          isSelected ? 'text-zinc-800' : null,
        )}
      />

      {open && (
        <motion.span
          initial={{ opacity: 0, width: 0 }}
          animate={{
            opacity: 1,
            width: 'auto',
          }}
          exit={{ opacity: 0, width: 0 }}
          transition={{ duration: 0.3 }}
          className={cn(
            '!m-0 inline-block whitespace-pre !p-0 text-[10px] md:text-sm text-zinc-500 transition duration-150 group-hover/sidebar:translate-y-0.5 group-hover/sidebar:md:translate-y-0 group-hover/sidebar:md:translate-x-1 group-hover/sidebar:text-zinc-900',
            isSelected ? 'text-zinc-900' : null,
          )}
        >
          {link.name}
        </motion.span>
      )}
    </NavLink>
  );
};

export const CollapseButton = () => {
  const { open, setOpen } = useSidebar();
  return (
    <div
      className={cn(
        'flex items-center gap-2 group/sidebar p-4 cursor-pointer hover:bg-zinc-100',
        open ? 'justify-start rounded-[52px]' : 'justify-center rounded-full',
      )}
      role="presentation"
      onClick={() => setOpen((prev) => !prev)}
    >
      {open ? (
        <ChevronsLeft className="size-5 text-zinc-400" />
      ) : (
        <ChevronsRight className="size-5 text-zinc-400" />
      )}

      {open && (
        <motion.span
          initial={{ opacity: 0, width: 0 }}
          animate={{
            opacity: 1,
            width: 'auto',
          }}
          exit={{ opacity: 0, width: 0 }}
          transition={{ duration: 0.3 }}
          className="!m-0 inline-block whitespace-pre !p-0 text-sm text-zinc-500 transition duration-150 group-hover/sidebar:translate-x-1 group-hover/sidebar:text-zinc-900"
        >
          Collapse
        </motion.span>
      )}
    </div>
  );
};

export const LogoutButton = () => {
  const { open } = useSidebar();
  return (
    <Link
      to="/logout"
      className={cn(
        'flex items-center gap-2 group/sidebar p-4 cursor-pointer hover:bg-zinc-100',
        open ? 'justify-start rounded-[52px]' : 'justify-center rounded-full',
      )}
      role="presentation"
      data-testid="logout-btn-desktop"
    >
      <LogIn className="size-5 text-zinc-400" />

      {open && (
        <motion.span
          initial={{ opacity: 0, width: 0 }}
          animate={{
            opacity: 1,
            width: 'auto',
          }}
          exit={{ opacity: 0, width: 0 }}
          transition={{ duration: 0.3 }}
          className="!m-0 inline-block whitespace-pre !p-0 text-sm text-zinc-500 transition duration-150 group-hover/sidebar:translate-x-1 group-hover/sidebar:text-zinc-900"
        >
          Logout
        </motion.span>
      )}
    </Link>
  );
};

export const Logo = () => {
  return (
    <Link
      to="#"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
    >
      <motion.svg
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        xmlns="http://www.w3.org/2000/svg"
        width="164"
        height="30"
        viewBox="0 0 164 30"
        fill="none"
      >
        <path
          d="M0.763044 4.97858C0.763044 -0.685352 12.589 -1.86125 13.3306 4.91978C13.3507 5.37054 13.1502 5.58613 12.8095 5.58613H9.86302C9.52227 5.58613 9.36192 5.42934 9.28174 5.07657C8.82073 2.41119 4.7518 3.01874 4.7518 4.97858C4.7518 8.03592 13.6313 5.78211 13.6313 11.544C13.6313 17.9331 0.682868 18.0899 0.00137234 11.2893C-0.0186717 10.8777 0.181768 10.7013 0.54256 10.7013H3.48903C3.80973 10.7013 3.99013 10.8777 4.07031 11.2501C4.5714 13.9154 9.50223 13.7978 9.50223 11.544C9.50223 8.68267 0.763044 10.7013 0.763044 4.97858ZM25.3771 1.21569C25.3771 0.84332 25.5374 0.627738 25.9784 0.627738H28.7845C29.2055 0.627738 29.4059 0.84332 29.4059 1.21569V8.87865C29.4059 12.6807 26.9806 16.1888 22.17 16.1888C17.3595 16.1888 14.9141 12.6807 14.9141 8.87865L14.8941 1.21569C14.8941 0.84332 15.1145 0.627738 15.5154 0.627738H18.3617C18.8227 0.627738 18.983 0.84332 18.983 1.21569L19.0031 8.87865C19.0031 11.7596 20.5064 12.6611 22.17 12.6611C23.8337 12.6611 25.357 11.7596 25.357 8.87865L25.3771 1.21569ZM60.3338 6.62484H52.7171C52.7171 5.07657 54.2605 3.27352 56.7259 3.27352C59.1913 3.27352 60.3338 5.07657 60.3338 6.62484ZM64.3426 8.91785V8.36909C64.3426 3.95946 61.7569 0.157377 56.6256 0.157377C52.8173 0.157377 50.0913 2.62677 49.0891 5.8605C48.6481 7.27159 48.588 8.80026 48.9087 10.2701C49.7105 13.8762 52.5768 16.62 56.6256 16.62C57.2671 16.62 62.5587 16.62 64.1822 11.5636C64.2825 11.2305 64.1422 11.1129 63.8615 11.1129H60.6545C60.4541 11.1129 60.3138 11.2109 60.2135 11.4068C59.8928 12.0732 59.051 13.3863 56.6256 13.3863C54.4809 13.3863 52.7171 11.5048 52.7171 9.545H63.7212C64.1221 9.545 64.3426 9.30982 64.3426 8.91785ZM147.505 6.66404H140.45C140.45 5.15496 141.752 3.39111 144.178 3.39111C146.603 3.39111 147.505 5.15496 147.505 6.66404ZM151.815 8.91785V8.36909C151.815 3.95946 149.209 0.157377 144.078 0.157377C140.269 0.157377 137.543 2.60717 136.541 5.8605C136.08 7.27159 136.02 8.80026 136.361 10.2701C137.142 13.8762 140.029 16.62 144.078 16.62C144.719 16.62 150.011 16.62 151.654 11.5832C151.754 11.2305 151.614 11.1129 151.313 11.1129H148.126C147.906 11.1129 147.766 11.2109 147.665 11.4068C147.345 12.0732 146.503 13.4059 144.078 13.4059C141.933 13.4059 140.369 11.5244 140.369 9.545H151.173C151.594 9.545 151.815 9.30982 151.815 8.91785ZM162.558 0.627738C163.119 0.627738 163.4 0.941312 163.4 1.50966V3.80268C163.4 4.39063 163.079 4.6454 162.478 4.6454C158.97 4.6454 157.287 6.25247 157.287 10.3877V15.5813C157.287 15.9537 157.046 16.1496 156.705 16.1496H153.719C153.378 16.1496 153.178 15.9537 153.178 15.5813V10.3877C153.178 6.82082 154.2 0.627738 162.558 0.627738ZM125.517 0.627738H122.29C122.069 0.627738 121.989 0.706132 121.909 0.941312L118.662 10.3485L116.136 0.941312C116.076 0.706132 115.976 0.627738 115.755 0.627738H111.967C111.646 0.627738 111.686 0.823722 111.747 1.0393L115.635 15.7381C115.715 16.0713 115.856 16.1496 116.236 16.1496H120.265C120.566 16.1496 120.746 16.0321 120.847 15.7185L123.913 6.54645L126.96 15.7185C127.06 16.0321 127.261 16.1496 127.541 16.1496H131.59C131.971 16.1496 132.111 16.0713 132.191 15.7381L136.08 1.0393C136.14 0.823722 136.18 0.627738 135.84 0.627738H132.071C131.831 0.627738 131.73 0.706132 131.67 0.941312L129.145 10.3485L125.918 0.941312C125.838 0.706132 125.737 0.627738 125.517 0.627738ZM99.3594 8.36909C99.3594 5.60572 100.883 3.82227 103.308 3.82227C105.733 3.82227 107.477 5.60572 107.477 8.36909C107.477 11.1325 105.673 12.9551 103.308 12.9551C100.943 12.9551 99.3594 11.1521 99.3594 8.36909ZM103.308 0.157377C98.5777 0.157377 95.1702 3.95946 95.1702 8.36909C95.1702 12.7787 98.5777 16.62 103.308 16.62C108.038 16.62 111.666 12.8963 111.666 8.36909C111.666 3.84187 107.858 0.157377 103.308 0.157377ZM75.2064 0.627738C75.7677 0.627738 76.0483 0.941312 76.0483 1.50966V3.80268C76.0483 4.39063 75.7276 4.6454 75.1263 4.6454C71.6186 4.6454 69.9349 6.25247 69.9349 10.3877V15.5813C69.9349 15.9537 69.6943 16.1496 69.3536 16.1496H66.367C66.0263 16.1496 65.8259 15.9537 65.8259 15.5813V10.3877C65.8259 6.82082 66.8481 0.627738 75.2064 0.627738ZM81.5403 8.05552C81.5403 10.7797 83.0436 12.5631 85.4289 12.5631C87.8141 12.5631 89.4978 10.7993 89.4978 8.05552C89.4978 5.31175 87.754 3.58709 85.4289 3.58709C83.1038 3.58709 81.5403 5.35095 81.5403 8.05552ZM81.7608 14.5622V20.9316C81.7608 21.304 81.5403 21.5 81.1996 21.5H78.193C77.8522 21.5 77.6518 21.304 77.6518 20.9316V1.49007C77.6518 0.921714 77.9725 0.627738 78.5538 0.627738H81.0392C81.6406 0.627738 81.7608 0.921714 81.7608 1.49007V2.90115H81.9813C85.048 -2.74318 93.7872 0.314165 93.7872 8.05552C93.7872 16.3652 84.9077 17.8547 81.7608 14.5622ZM35.0383 8.05552C35.0383 10.7797 36.5616 12.5631 38.9268 12.5631C41.292 12.5631 42.9957 10.7993 42.9957 8.05552C42.9957 5.31175 41.2719 3.58709 38.9268 3.58709C36.5817 3.58709 35.0383 5.35095 35.0383 8.05552ZM35.2187 14.5622V20.9316C35.2187 21.304 34.9781 21.5 34.6374 21.5H31.6508C31.29 21.5 31.1097 21.304 31.1097 20.9316V1.49007C31.1097 0.921714 31.4103 0.627738 31.9916 0.627738H34.4971C35.0984 0.627738 35.2187 0.921714 35.2187 1.49007V2.90115H35.4191C38.4858 -2.74318 47.225 0.314165 47.225 8.05552C47.225 16.3652 38.3455 17.8547 35.2187 14.5622Z"
          fill="#18181B"
        />
        <path
          d="M136.556 29.1915H135.506C135.459 29.1915 135.436 29.1681 135.436 29.1215V19.4055C135.436 19.3588 135.459 19.3355 135.506 19.3355H136.696C136.743 19.3355 136.766 19.3588 136.766 19.4055V22.7375C136.766 22.7655 136.78 22.7888 136.808 22.8075C136.836 22.8168 136.869 22.8028 136.906 22.7655C137.037 22.6161 137.293 22.4481 137.676 22.2615C138.068 22.0655 138.479 21.9675 138.908 21.9675C139.925 21.9675 140.733 22.3081 141.33 22.9895C141.937 23.6615 142.24 24.5481 142.24 25.6495C142.24 26.7508 141.937 27.6421 141.33 28.3235C140.733 28.9955 139.925 29.3315 138.908 29.3315C138.572 29.3315 138.203 29.2475 137.802 29.0795C137.401 28.9115 137.102 28.7295 136.906 28.5335C136.841 28.4681 136.794 28.4775 136.766 28.5615L136.626 29.1215C136.607 29.1681 136.584 29.1915 136.556 29.1915ZM140.336 27.4555C140.719 26.9888 140.91 26.3868 140.91 25.6495C140.91 24.9121 140.719 24.3148 140.336 23.8575C139.953 23.3908 139.431 23.1575 138.768 23.1575C138.143 23.1575 137.653 23.3861 137.298 23.8435C136.943 24.3008 136.766 24.9028 136.766 25.6495C136.766 26.3961 136.943 26.9981 137.298 27.4555C137.653 27.9128 138.143 28.1415 138.768 28.1415C139.431 28.1415 139.953 27.9128 140.336 27.4555Z"
          fill="#18181B"
        />
        <path
          d="M149.922 26.1255H144.728C144.681 26.1255 144.658 26.1488 144.658 26.1955C144.658 26.7275 144.84 27.1848 145.204 27.5675C145.568 27.9501 146.049 28.1415 146.646 28.1415C147.486 28.1415 148.079 27.8148 148.424 27.1615C148.443 27.1148 148.475 27.0915 148.522 27.0915H149.768C149.824 27.0915 149.847 27.1148 149.838 27.1615C149.661 27.8428 149.283 28.3748 148.704 28.7575C148.135 29.1401 147.449 29.3315 146.646 29.3315C145.61 29.3315 144.784 28.9955 144.168 28.3235C143.552 27.6421 143.244 26.7508 143.244 25.6495C143.244 24.5295 143.542 23.6381 144.14 22.9755C144.747 22.3035 145.582 21.9675 146.646 21.9675C147.719 21.9675 148.555 22.3035 149.152 22.9755C149.758 23.6475 150.062 24.5388 150.062 25.6495C150.062 25.7988 150.048 25.9295 150.02 26.0415C150.001 26.0975 149.969 26.1255 149.922 26.1255ZM148.606 25.0055C148.606 24.5388 148.438 24.1141 148.102 23.7315C147.766 23.3488 147.281 23.1575 146.646 23.1575C146.03 23.1575 145.544 23.3675 145.19 23.7875C144.835 24.1981 144.658 24.6041 144.658 25.0055C144.658 25.0521 144.681 25.0755 144.728 25.0755H148.536C148.583 25.0755 148.606 25.0521 148.606 25.0055Z"
          fill="#18181B"
        />
        <path
          d="M154.912 28.0715V29.1215C154.912 29.1681 154.888 29.1915 154.842 29.1915H153.764C152.541 29.1915 151.93 28.6408 151.93 27.5395V23.2275C151.93 23.1808 151.906 23.1575 151.86 23.1575H150.614C150.567 23.1575 150.544 23.1341 150.544 23.0875V22.1775C150.544 22.1308 150.567 22.1075 150.614 22.1075H151.86C151.906 22.1075 151.93 22.0841 151.93 22.0375V20.1475C151.93 20.1008 151.953 20.0775 152 20.0775H153.19C153.236 20.0775 153.26 20.1008 153.26 20.1475V22.0375C153.26 22.0841 153.283 22.1075 153.33 22.1075H154.842C154.888 22.1075 154.912 22.1308 154.912 22.1775V23.0875C154.912 23.1341 154.888 23.1575 154.842 23.1575H153.33C153.283 23.1575 153.26 23.1808 153.26 23.2275V27.3015C153.26 27.7681 153.512 28.0015 154.016 28.0015H154.842C154.888 28.0015 154.912 28.0248 154.912 28.0715Z"
          fill="#18181B"
        />
        <path
          d="M162.905 28.0715V29.1215C162.905 29.1681 162.882 29.1915 162.835 29.1915H162.569C161.776 29.1915 161.281 28.9535 161.085 28.4775C161.057 28.4028 161.015 28.3935 160.959 28.4495C160.371 29.0375 159.564 29.3315 158.537 29.3315C157.678 29.3315 157.006 29.1308 156.521 28.7295C156.045 28.3188 155.807 27.7728 155.807 27.0915C155.807 26.4661 156.073 25.9575 156.605 25.5655C157.137 25.1641 157.874 24.9635 158.817 24.9635H160.315C160.455 24.9635 160.567 24.9168 160.651 24.8235C160.735 24.7208 160.777 24.6135 160.777 24.5015C160.777 24.3148 160.763 24.1608 160.735 24.0395C160.707 23.9181 160.642 23.7828 160.539 23.6335C160.436 23.4748 160.259 23.3581 160.007 23.2835C159.755 23.1995 159.433 23.1575 159.041 23.1575C158.472 23.1575 158.047 23.2741 157.767 23.5075C157.496 23.7408 157.361 24.0488 157.361 24.4315C157.361 24.4781 157.338 24.5015 157.291 24.5015H156.101C156.054 24.5015 156.031 24.4781 156.031 24.4315C156.031 23.6475 156.32 23.0408 156.899 22.6115C157.478 22.1821 158.192 21.9675 159.041 21.9675C160.021 21.9675 160.777 22.1821 161.309 22.6115C161.841 23.0315 162.107 23.6615 162.107 24.5015V27.5395C162.107 27.6515 162.149 27.7588 162.233 27.8615C162.317 27.9548 162.429 28.0015 162.569 28.0015H162.835C162.882 28.0015 162.905 28.0248 162.905 28.0715ZM160.777 26.2795V26.0835C160.777 26.0368 160.754 26.0135 160.707 26.0135H158.817C158.238 26.0135 157.814 26.1208 157.543 26.3355C157.272 26.5501 157.137 26.8021 157.137 27.0915C157.137 27.3621 157.263 27.6048 157.515 27.8195C157.767 28.0341 158.108 28.1415 158.537 28.1415C159.312 28.1415 159.876 27.9595 160.231 27.5955C160.595 27.2221 160.777 26.7835 160.777 26.2795Z"
          fill="#18181B"
        />
      </motion.svg>
    </Link>
  );
};
export const LogoIcon = () => {
  return (
    <div className="size-8 w-full py-1">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="33"
        height="32"
        viewBox="0 0 33 32"
        fill="none"
        className="mx-auto shrink-0"
      >
        <rect
          x="1.18415"
          y="0.285714"
          width="31.4286"
          height="31.4286"
          rx="7.71429"
          fill="#18181B"
        />
        <rect
          x="1.18415"
          y="0.285714"
          width="31.4286"
          height="31.4286"
          rx="7.71429"
          stroke="#18181B"
          strokeWidth="0.571429"
        />
        <path
          d="M10.8798 12.6808C10.8798 7.04923 22.6382 5.88004 23.3755 12.6223C23.3955 13.0705 23.1962 13.2849 22.8574 13.2849H19.9277C19.5889 13.2849 19.4295 13.129 19.3498 12.7782C18.8914 10.1281 14.8457 10.7322 14.8457 12.6808C14.8457 15.7207 23.6745 13.4797 23.6745 19.2087C23.6745 25.5613 10.8001 25.7172 10.1225 18.9554C10.1025 18.5462 10.3018 18.3708 10.6606 18.3708H13.5902C13.9091 18.3708 14.0884 18.5462 14.1681 18.9164C14.6664 21.5666 19.569 21.4497 19.569 19.2087C19.569 16.3637 10.8798 18.3708 10.8798 12.6808Z"
          fill="white"
        />
      </svg>
    </div>
  );
};
