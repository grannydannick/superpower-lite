import { ChevronRight } from 'lucide-react';
import { NavLink } from 'react-router';

import { H2 } from '@/components/ui/typography';
import { Product } from '@/types/api';

import { SupplementCard } from './supplement-card';

type SupplementCategoryProps = {
  title: string;
  subtitle?: string;
  products: Product[];
  path?: string;
};

export const SupplementCategory = ({
  title,
  subtitle,
  products,
  path,
}: SupplementCategoryProps) => {
  const handleViewAllClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="flex flex-col">
          <H2>{title}</H2>
          {subtitle && <H2 className="text-secondary">{subtitle}</H2>}
        </div>
        {path && (
          <NavLink
            to={path}
            className="group inline-flex items-center gap-1 text-secondary hover:text-primary"
            onClick={handleViewAllClick}
          >
            View all
            <ChevronRight className="size-4" />
          </NavLink>
        )}
      </div>

      <div className="grid grid-cols-2 gap-x-2 gap-y-4 sm:gap-x-6 sm:gap-y-8 lg:grid-cols-4">
        {products.map((product) => (
          <SupplementCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};
