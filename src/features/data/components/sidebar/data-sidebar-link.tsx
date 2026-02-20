import { Heart } from 'lucide-react';

import { MiniScoreChart } from '@/components/ui/charts/mini-score-chart/mini-score-chart';
import { Link } from '@/components/ui/link';
import { cn } from '@/lib/utils';
import { Category } from '@/types/api';

import { encodeCategory } from '../../utils/category/encode-category';

export const DataSidebarLink = ({
  category,
  isActive,
  className,
}: {
  category: Category;
  isActive: boolean;
  className?: string;
}) => {
  const isSummary = category.category === 'Summary';

  // summary acts as the root
  const link =
    category.category && !isSummary
      ? `/data?category=${encodeCategory(category.category)}`
      : '/data';

  return (
    <Link
      to={link}
      onClick={() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
      id={`selector-${category.category.toLowerCase()}`}
      key={category.category}
      className={cn(
        'relative z-[1] flex shrink-0 gap-2 self-start truncate rounded-full border border-transparent p-0.5 pr-3 transition-colors md:w-full lg:w-auto',
        isActive
          ? 'text-black'
          : 'group text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700',
        className,
      )}
    >
      {category.category === 'Summary' ? (
        <div className="flex size-6 items-center justify-center rounded-full bg-zinc-200 p-1 text-zinc-400">
          <Heart className="size-full" />
        </div>
      ) : (
        <MiniScoreChart value={category.value} />
      )}
      <span className="truncate">{category.category}</span>
    </Link>
  );
};
