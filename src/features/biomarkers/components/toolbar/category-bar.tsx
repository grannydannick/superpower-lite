import cn from 'classnames';

import { Button } from '@/components/ui/button';
import { TOOLBAR_CATEGORIES } from '@/features/biomarkers/const/toolbar-options';
import { ToolbarCategoryType } from '@/features/biomarkers/types/filters';

type CategoryBarProps = {
  currentCategory: string | undefined;
  setCurrentCategory: (currentCategory: ToolbarCategoryType) => void;
};

const CategoryBar = ({
  currentCategory,
  setCurrentCategory,
}: CategoryBarProps): JSX.Element => {
  return (
    <div className="relative z-[1] overflow-x-auto rounded-2xl shadow-[0px_4px_24px_0px_rgba(0,0,0,0.05)]">
      <div className="flex flex-nowrap rounded-2xl bg-white p-4 scrollbar-none">
        {TOOLBAR_CATEGORIES.map((category) => (
          <Button
            key={category.name}
            variant="ghost"
            size="small"
            className={cn(
              'bg-white rounded-lg h-8 py-2 px-3 text-nowrap text-sm md:text-base',
              category.name === currentCategory
                ? 'text-vermillion-700'
                : 'text-gray-400',
            )}
            onClick={() => setCurrentCategory(category.name)}
          >
            {category.name}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default CategoryBar;
