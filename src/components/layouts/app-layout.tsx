import {
  Home,
  Folder,
  Ellipsis,
  EllipsisVertical,
  MessageSquare,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
// import { NavLink, useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
// import { useLogout } from '@/lib/auth';
import { cn } from '@/utils/cn';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../ui/dropdown';

type SideNavigationItem = {
  name: string;
  to: string;
  icon: (props: React.SVGProps<SVGSVGElement>) => JSX.Element;
};

export function AppLayout({ children }: { children: React.ReactNode }) {
  // const logout = useLogout();
  // const navigate = useNavigate();
  const navigation = [
    { name: 'Home', to: '.', icon: Home },
    { name: 'Data', to: './data', icon: Folder },
    { name: 'Concierge', to: './concierge', icon: MessageSquare },
  ].filter(Boolean) as SideNavigationItem[];

  return (
    <>
      <main
        className={cn('bg-white min-h-dvh pb-24')}
        style={{
          backgroundImage: 'radial-gradient(#E8E8E8 1px, transparent 0)',
          backgroundSize: '20px 20px',
          backgroundPosition: '-12 -12',
        }}
      >
        <div className="container mx-auto p-16 pt-9">{children}</div>
      </main>
      <div className="fixed bottom-12 left-1/2 z-10 flex -translate-x-1/2 rounded-full bg-black p-1.5">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.to}
            className={({ isActive }) =>
              cn(
                `flex px-[14px] xs:px-4 py-2 xs:py-3 flex-col xs:flex-row items-center justify-center xs:justify-between gap-[5px] xs:gap-3 rounded-full hover:bg-[#252525] transition duration-200 ease-in-out cursor-pointer`,
                isActive ? 'opacity-100 bg-[#252525]' : 'opacity-50',
              )
            }
          >
            <item.icon
              className={cn('text-white', 'size-4 shrink-0')}
              aria-hidden="true"
            />
            <p className="text-sm text-white xs:text-base">{item.name}</p>
          </NavLink>
        ))}
        <DropdownMenu>
          <DropdownMenuTrigger
            className="rounded-full opacity-50 outline-none hover:bg-[#252525]"
            asChild
          >
            <Button>
              <EllipsisVertical
                size={18}
                color="white"
                className="hidden sm:block"
              />
              <Ellipsis color="white" className="block sm:hidden" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[244px] rounded-3xl border-none bg-black p-1.5 text-white outline-none xs:w-[178px]"
            side="bottom"
            sideOffset={10}
            align="end"
          >
            <div className="flex flex-col gap-1.5">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.to}
                  className="flex cursor-pointer items-center gap-3 rounded-[18px] p-4 transition duration-200 ease-in-out hover:bg-[#252525]"
                >
                  <item.icon
                    className={cn(
                      'text-gray-400 group-hover:text-gray-300',
                      'mr-4 size-6 shrink-0',
                    )}
                    aria-hidden="true"
                  />
                  <p className="text-sm text-white">{item.name}</p>
                </NavLink>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}
