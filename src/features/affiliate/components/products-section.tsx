import { Link } from '@tanstack/react-router';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Body1, Body2, H3 } from '@/components/ui/typography';
import { Product } from '@/types/api';

import { useProductRecommendations } from '../hooks/use-product-recommendations';

export const ProductsSection = () => {
  const { recommendedProducts, isLoading, plan } = useProductRecommendations();
  const planId: string | null = plan?.id ?? null;

  return (
    <section>
      <H3>Turn your credits into results</H3>
      <Body1 className="text-secondary">
        Shop recommendations from{' '}
        {planId != null ? 'your last action plan' : 'our marketplace'}
      </Body1>
      <div className="mt-6">
        {isLoading ? (
          <div className="flex h-48 w-full items-center justify-center">
            <Spinner variant="primary" />
          </div>
        ) : (
          <div className="relative pb-10">
            <ul className="space-y-2">
              {recommendedProducts.map((product) => (
                <ProductItem key={product.id} product={product} />
              ))}
            </ul>
            <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-white to-transparent" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
              {planId != null ? (
                <Button asChild className="rounded-full">
                  <Link to="/plans/$id" params={{ id: planId }}>
                    View your action plan
                  </Link>
                </Button>
              ) : (
                <Button asChild className="rounded-full">
                  <Link to="/marketplace" state={{ from: location.pathname }}>
                    Explore all products
                  </Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export const ProductItem = ({ product }: { product: Product }) => {
  return (
    <li className="flex items-center gap-4 overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 drop-shadow-sm">
      <div className="">
        <img
          src={product.image}
          alt={product.name}
          className="size-12 rounded-xl object-cover"
        />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <Body1>{product.name}</Body1>
        </div>
        <div className="flex items-center gap-2">
          <Body2 className="text-secondary line-through">
            ${product.price.toFixed(2)}
          </Body2>
          <span className="text-secondary">·</span>
          <ProductPrice product={product} />
        </div>
      </div>
    </li>
  );
};

export const ProductPrice = ({ product }: { product: Product }) => {
  if (product.price < 50) {
    return <Body2 className="text-secondary">1 referral gets it free</Body2>;
  }
  const discountedPrice = product.price - 50;
  return (
    <Body2 className="text-secondary">
      1 referral gets it for
      <span className=""> ${discountedPrice.toFixed(2)}</span>
    </Body2>
  );
};
