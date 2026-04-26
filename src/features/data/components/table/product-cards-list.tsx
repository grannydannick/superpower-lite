import { useNavigate } from '@tanstack/react-router';

import { SelectableCard } from '@/components/shared/selectable-card';
import { Button } from '@/components/ui/button';
import { H3 } from '@/components/ui/typography';
import { useOrders } from '@/features/orders/api';
import { OrderStatus } from '@/types/api';

export type ProductCardItem = {
  id: string;
  slug: string;
  title: string;
  shortDescription?: string | null;
  description?: string | null;
  image?: string | null;
  status: string;
  legacyServiceId?: string;
};

export const ProductCardsList = ({
  products,
  title,
  showRetests = false,
  excludeSlugs,
  onNavigate,
}: {
  products: ProductCardItem[];
  title?: string;
  showRetests?: boolean;
  excludeSlugs?: string[];
  onNavigate?: () => void;
}) => {
  const navigate = useNavigate();
  const { data: ordersData } = useOrders();

  const completedServiceIds = new Set(
    ordersData?.requestGroups
      .flatMap((rg) => rg.orders)
      .filter((o) => o.status === OrderStatus.completed)
      .map((o) => o.serviceId) ?? [],
  );

  const published = products.filter((p) => {
    if (p.status !== 'published') return false;
    if (excludeSlugs?.includes(p.slug)) return false;
    const isCompleted =
      !!p.legacyServiceId && completedServiceIds.has(p.legacyServiceId);
    return showRetests || !isCompleted;
  });

  if (published.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 pb-4">
      {title && <H3>{title}</H3>}
      <div className="space-y-2">
        {published.map((product) => {
          const isCompleted =
            !!product.legacyServiceId &&
            completedServiceIds.has(product.legacyServiceId);
          return (
            <SelectableCard
              key={product.id}
              title={product.title}
              description={
                product.shortDescription ?? product.description ?? ''
              }
              imageSrc={product.image ?? undefined}
              onToggle={() => {
                onNavigate?.();
                void navigate({
                  to: '/marketplace/products/$slug',
                  params: { slug: product.slug },
                });
              }}
              trigger={
                <Button
                  size="small"
                  variant="outline"
                  onClick={() => {
                    onNavigate?.();
                    void navigate({
                      to: '/marketplace/products/$slug',
                      params: { slug: product.slug },
                    });
                  }}
                >
                  {isCompleted ? 'Retest' : 'Unlock'}
                </Button>
              }
            />
          );
        })}
      </div>
    </div>
  );
};
