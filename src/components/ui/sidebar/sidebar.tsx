import { motion } from 'framer-motion';
import {
  ChevronsLeft,
  ChevronsRight,
  Ellipsis,
  LogIn,
  LogOut,
  LucideIcon,
  Settings,
} from 'lucide-react';
import React, {
  useState,
  createContext,
  useContext,
  FC,
  SVGProps,
} from 'react';
import { Link, LinkProps, NavLink, useLocation } from 'react-router-dom';

import {
  DataIcon,
  HomeIcon,
  MarketplaceIcon,
  MessageIcon,
  ServicesIcon,
  LockIcon,
} from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown';
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
      // to: isMobileView ? '/settings' : '/settings/profile',
    },
    checkAccess({ allowedRoles: [ROLES.ADMIN] }) && {
      name: 'Admin',
      to: './admin/users',
      icon: LockIcon,
    },
  ].filter(Boolean) as Link[];

  return (
    <>
      <motion.div
        className={cn(
          'max-h-screen px-4 py-4 hidden md:flex md:flex-col bg-white flex-shrink-0 w-[196px] md:justify-between md:gap-10 border-r border-r-zinc-200',
        )}
        animate={{
          width: open ? '196px' : '88px',
        }}
      >
        <div className="flex overflow-y-auto overflow-x-hidden md:flex-col">
          {open ? <Logo /> : <LogoIcon />}
          <div className="flex w-full justify-between gap-2 md:mt-8 md:flex-col">
            {desktopLinks.map((link, idx) => (
              <SidebarLink key={idx} link={link} />
            ))}
          </div>
        </div>
        <div>
          <CollapseButton />
          <div className="space-y-2.5 border-t border-t-zinc-200 py-5">
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
      // to: isMobileView ? '/settings' : '/settings/profile',
    },
  ];

  return (
    <>
      <div
        className={cn(
          'flex justify-between md:hidden  items-center w-full p-4 fixed bottom-0 bg-white border-t border-t-zinc-100 z-40',
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
                <NavLink
                  key={i}
                  to={link.to}
                  className="flex cursor-pointer items-center gap-3 rounded-[18px] p-4 transition duration-200 ease-in-out hover:bg-[#252525]"
                >
                  <link.icon width={12} height={12} color="white" />

                  <p className="text-sm text-white">{link.name}</p>
                </NavLink>
              ))}
              <NavLink
                to="/auth/logout"
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

  return (
    <NavLink
      to={link.to}
      end
      className={({ isActive }) =>
        [
          isActive ? 'bg-zinc-100' : null,
          'flex flex-col md:flex-row items-center gap-2 group/sidebar p-4 cursor-pointer hover:bg-zinc-100',
          open ? 'justify-start rounded-[52px]' : 'justify-center rounded-full',
          className,
        ].join(' ')
      }
      {...props}
    >
      <Icon
        className={cn(
          'w-5 h-5 text-zinc-400',
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
            '!m-0 inline-block whitespace-pre !p-0 text-[10px] md:text-sm text-zinc-500 transition duration-150 group-hover/sidebar:translate-y-1 group-hover/sidebar:md:translate-y-0 group-hover/sidebar:md:translate-x-1 group-hover/sidebar:text-zinc-900',
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
      to="/auth/logout"
      className={cn(
        'flex items-center gap-2 group/sidebar p-4 cursor-pointer hover:bg-zinc-100',
        open ? 'justify-start rounded-[52px]' : 'justify-center rounded-full',
      )}
      role="presentation"
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
        height="22"
        viewBox="0 0 164 22"
        fill="none"
      >
        <path
          d="M0.962263 4.97858C0.962263 -0.685352 12.7882 -1.86125 13.5298 4.91978C13.5499 5.37054 13.3495 5.58613 13.0087 5.58613H10.0622C9.72149 5.58613 9.56114 5.42934 9.48096 5.07657C9.01995 2.41119 4.95102 3.01874 4.95102 4.97858C4.95102 8.03592 13.8305 5.78211 13.8305 11.544C13.8305 17.9331 0.882087 18.0899 0.200591 11.2893C0.180547 10.8777 0.380987 10.7013 0.741779 10.7013H3.68825C4.00895 10.7013 4.18935 10.8777 4.26952 11.2501C4.77062 13.9154 9.70145 13.7978 9.70145 11.544C9.70145 8.68267 0.962263 10.7013 0.962263 4.97858ZM25.5763 1.21569C25.5763 0.84332 25.7366 0.627738 26.1776 0.627738H28.9838C29.4047 0.627738 29.6051 0.84332 29.6051 1.21569V8.87865C29.6051 12.6807 27.1798 16.1888 22.3693 16.1888C17.5587 16.1888 15.1133 12.6807 15.1133 8.87865L15.0933 1.21569C15.0933 0.84332 15.3138 0.627738 15.7146 0.627738H18.5609C19.0219 0.627738 19.1823 0.84332 19.1823 1.21569L19.2023 8.87865C19.2023 11.7596 20.7056 12.6611 22.3693 12.6611C24.0329 12.6611 25.5562 11.7596 25.5562 8.87865L25.5763 1.21569ZM60.533 6.62484H52.9163C52.9163 5.07657 54.4597 3.27352 56.9251 3.27352C59.3905 3.27352 60.533 5.07657 60.533 6.62484ZM64.5418 8.91785V8.36909C64.5418 3.95946 61.9561 0.157377 56.8249 0.157377C53.0165 0.157377 50.2905 2.62677 49.2883 5.8605C48.8474 7.27159 48.7872 8.80026 49.1079 10.2701C49.9097 13.8762 52.776 16.62 56.8249 16.62C57.4663 16.62 62.7579 16.62 64.3815 11.5636C64.4817 11.2305 64.3414 11.1129 64.0608 11.1129H60.8537C60.6533 11.1129 60.513 11.2109 60.4128 11.4068C60.092 12.0732 59.2502 13.3863 56.8249 13.3863C54.6802 13.3863 52.9163 11.5048 52.9163 9.545H63.9204C64.3213 9.545 64.5418 9.30982 64.5418 8.91785ZM147.704 6.66404H140.649C140.649 5.15496 141.952 3.39111 144.377 3.39111C146.802 3.39111 147.704 5.15496 147.704 6.66404ZM152.014 8.91785V8.36909C152.014 3.95946 149.408 0.157377 144.277 0.157377C140.468 0.157377 137.742 2.60717 136.74 5.8605C136.279 7.27159 136.219 8.80026 136.56 10.2701C137.342 13.8762 140.228 16.62 144.277 16.62C144.918 16.62 150.21 16.62 151.853 11.5832C151.954 11.2305 151.813 11.1129 151.513 11.1129H148.326C148.105 11.1129 147.965 11.2109 147.865 11.4068C147.544 12.0732 146.702 13.4059 144.277 13.4059C142.132 13.4059 140.569 11.5244 140.569 9.545H151.372C151.793 9.545 152.014 9.30982 152.014 8.91785ZM162.757 0.627738C163.319 0.627738 163.599 0.941312 163.599 1.50966V3.80268C163.599 4.39063 163.279 4.6454 162.677 4.6454C159.169 4.6454 157.486 6.25247 157.486 10.3877V15.5813C157.486 15.9537 157.245 16.1496 156.905 16.1496H153.918C153.577 16.1496 153.377 15.9537 153.377 15.5813V10.3877C153.377 6.82082 154.399 0.627738 162.757 0.627738ZM125.716 0.627738H122.489C122.269 0.627738 122.188 0.706132 122.108 0.941312L118.861 10.3485L116.335 0.941312C116.275 0.706132 116.175 0.627738 115.955 0.627738H112.166C111.846 0.627738 111.886 0.823722 111.946 1.0393L115.834 15.7381C115.915 16.0713 116.055 16.1496 116.436 16.1496H120.465C120.765 16.1496 120.946 16.0321 121.046 15.7185L124.113 6.54645L127.159 15.7185C127.259 16.0321 127.46 16.1496 127.741 16.1496H131.789C132.17 16.1496 132.311 16.0713 132.391 15.7381L136.279 1.0393C136.339 0.823722 136.379 0.627738 136.039 0.627738H132.27C132.03 0.627738 131.93 0.706132 131.87 0.941312L129.344 10.3485L126.117 0.941312C126.037 0.706132 125.937 0.627738 125.716 0.627738ZM99.5587 8.36909C99.5587 5.60572 101.082 3.82227 103.507 3.82227C105.933 3.82227 107.676 5.60572 107.676 8.36909C107.676 11.1325 105.873 12.9551 103.507 12.9551C101.142 12.9551 99.5587 11.1521 99.5587 8.36909ZM103.507 0.157377C98.777 0.157377 95.3695 3.95946 95.3695 8.36909C95.3695 12.7787 98.777 16.62 103.507 16.62C108.238 16.62 111.866 12.8963 111.866 8.36909C111.866 3.84187 108.057 0.157377 103.507 0.157377ZM75.4057 0.627738C75.9669 0.627738 76.2475 0.941312 76.2475 1.50966V3.80268C76.2475 4.39063 75.9268 4.6454 75.3255 4.6454C71.8178 4.6454 70.1341 6.25247 70.1341 10.3877V15.5813C70.1341 15.9537 69.8936 16.1496 69.5528 16.1496H66.5662C66.2255 16.1496 66.0251 15.9537 66.0251 15.5813V10.3877C66.0251 6.82082 67.0473 0.627738 75.4057 0.627738ZM81.7396 8.05552C81.7396 10.7797 83.2429 12.5631 85.6281 12.5631C88.0133 12.5631 89.697 10.7993 89.697 8.05552C89.697 5.31175 87.9532 3.58709 85.6281 3.58709C83.303 3.58709 81.7396 5.35095 81.7396 8.05552ZM81.96 14.5622V20.9316C81.96 21.304 81.7395 21.5 81.3988 21.5H78.3922C78.0515 21.5 77.851 21.304 77.851 20.9316V1.49007C77.851 0.921714 78.1717 0.627738 78.753 0.627738H81.2385C81.8398 0.627738 81.96 0.921714 81.96 1.49007V2.90115H82.1805C85.2473 -2.74318 93.9864 0.314165 93.9864 8.05552C93.9864 16.3652 85.1069 17.8547 81.96 14.5622ZM35.2375 8.05552C35.2375 10.7797 36.7608 12.5631 39.126 12.5631C41.4912 12.5631 43.195 10.7993 43.195 8.05552C43.195 5.31175 41.4712 3.58709 39.126 3.58709C36.7809 3.58709 35.2375 5.35095 35.2375 8.05552ZM35.4179 14.5622V20.9316C35.4179 21.304 35.1774 21.5 34.8366 21.5H31.8501C31.4893 21.5 31.3089 21.304 31.3089 20.9316V1.49007C31.3089 0.921714 31.6095 0.627738 32.1908 0.627738H34.6963C35.2976 0.627738 35.4179 0.921714 35.4179 1.49007V2.90115H35.6183C38.6851 -2.74318 47.4242 0.314165 47.4242 8.05552C47.4242 16.3652 38.5448 17.8547 35.4179 14.5622Z"
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
