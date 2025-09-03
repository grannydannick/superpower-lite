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

  const handleAddToCart = useCallback(() => {
    if (product) {
      addProduct(product);
    }
    setSearchParams((params) => {
      params.set('modal', 'checkout');
      return params;
    });
  }, [product, addProduct, setSearchParams]);

  const handleRemoveFromCart = useCallback(() => {
    if (product) {
      removeProduct(product.id);
    }
  }, [product, removeProduct]);

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
      return 'Available in stock';
    } else {
      return 'Product out of stock';
    }
  }, [product, isProductAvailable]);

  const isSelected = useMemo(() => {
    return product ? isProductSelected(product.id) : false;
  }, [product, isProductSelected]);

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

  if (product) {
    return (
      <ActivityCard
        {...product}
        name={productName}
        description={
          <div className="flex items-center gap-2 text-zinc-500">
            <Body1 className="italic text-zinc-500">{productMessage}</Body1>
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
              name={productName}
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
            your clinician for assistance.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
