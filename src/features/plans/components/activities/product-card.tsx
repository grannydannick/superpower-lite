import { HelpCircle } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Body1 } from '@/components/ui/typography';
import { useAnalytics } from '@/hooks/use-analytics';
import { cn } from '@/lib/utils';
import { Product } from '@/types/api';

import { useCarePlanCart } from '../../stores/care-plan-cart-store';

import { ActivityCard } from './activity-card';

interface ProductCardProps {
  productName: string;
  product?: Product;
  className?: string;
  hideButton?: boolean;
}

export const ProductCard = ({
  productName,
  product,
  className,
  hideButton = false,
}: ProductCardProps) => {
  const [, setSearchParams] = useSearchParams();
  const { addProduct, removeProduct, isProductSelected } = useCarePlanCart();
  const { track } = useAnalytics();

  const handleAddToCart = useCallback(() => {
    if (product) {
      track('aiap_added_product_to_cart', {
        product_id: product.id,
        product_name: product.name,
        product_price: product.price,
      });
      addProduct(product);
    }
    setSearchParams((params) => {
      params.set('modal', 'checkout');
      return params;
    });
  }, [product, addProduct, setSearchParams, track]);

  const handleRemoveFromCart = useCallback(() => {
    if (product) {
      track('aiap_removed_product_from_cart', {
        product_id: product.id,
        product_name: product.name,
        product_price: product.price,
      });
      removeProduct(product.id);
    }
  }, [product, removeProduct, track]);

  const isProductAvailable = useMemo(() => {
    if (!product) return false;
    return (
      product.inventoryQuantity === undefined ||
      product.inventoryQuantity === null ||
      product.inventoryQuantity > 0
    );
  }, [product]);

  const productMessage = useMemo(() => {
    if (!product) return 'Product not available';
    if (isProductAvailable) {
      return (
        <span className="">
          <span className="mr-2 text-zinc-500 line-through">
            ${product.price.toFixed(2)}
          </span>
          <span className="font-semibold">
            ${(product.price * (1 - product.discount / 100)).toFixed(2)}
          </span>
        </span>
      );
    } else {
      return <span className="italic text-zinc-500">Product out of stock</span>;
    }
  }, [product, isProductAvailable]);

  const isSelected = product ? isProductSelected(product.id) : false;

  const actionButton = useMemo(() => {
    if (!isProductAvailable || !product || hideButton) return null;
    return (
      <Button
        size="medium"
        onClick={isSelected ? handleRemoveFromCart : handleAddToCart}
        variant={isSelected ? 'outline' : 'default'}
      >
        {isSelected ? 'Remove from Cart' : 'Add to Cart'}
      </Button>
    );
  }, [
    isProductAvailable,
    product,
    isSelected,
    handleRemoveFromCart,
    handleAddToCart,
    hideButton,
  ]);

  const productTitle = useMemo(() => {
    if (!product || !product.url) return productName;
    return (
      <a
        href={product.url}
        target="_blank"
        rel="noreferrer"
        className="decoration-transparent underline-offset-4 transition-[text-decoration-color] duration-300 hover:underline hover:decoration-zinc-900/80"
      >
        {productName}
      </a>
    );
  }, [product, productName]);

  if (product) {
    return (
      <ActivityCard
        {...product}
        name={productTitle}
        alt={product.name}
        description={
          <div className="flex items-center gap-2 text-zinc-500">
            <Body1 className="">{productMessage}</Body1>
          </div>
        }
        actionBtn={actionButton}
        className={className}
      />
    );
  }

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="group relative cursor-pointer">
            <ActivityCard
              name={productTitle}
              description={
                <div className="flex w-full items-center gap-2 text-zinc-500">
                  <Body1 className="italic text-zinc-500">
                    Product not available
                  </Body1>
                  <HelpCircle size={16} />
                </div>
              }
              className={cn(
                'opacity-70 hover:bg-zinc-50 cursor-pointer',
                className,
              )}
            />
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-96">
          <p className="text-center">
            Product not available in store. You can order it online or contact
            your concierge for assistance.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
