import { ChevronLeft } from '@/components/icons/chevron-left-icon';
import { Link } from '@/components/ui/link';
import { Body2 } from '@/components/ui/typography';

import { TableOfContents } from './navigation/table-of-contents';

export const CarePlanSidebar = () => {
  return (
    <aside className="top-20 w-full max-w-48 shrink-0 space-y-4 lg:sticky lg:h-96 lg:pl-5 xl:pl-0">
      <Link to="/" className="group -ml-1.5 flex items-center gap-0.5 p-0">
        <ChevronLeft className="-mt-px w-[15px] text-zinc-400 transition-all duration-150 group-hover:-translate-x-0.5 group-hover:text-zinc-600" />
        <Body2 className="text-zinc-500 transition-all duration-150 group-hover:text-zinc-700">
          Home
        </Body2>
      </Link>
      <div className="hidden lg:block">
        <TableOfContents />
      </div>
    </aside>
  );
};
