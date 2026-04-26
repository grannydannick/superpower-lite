import { createFileRoute } from '@tanstack/react-router';

import { ProductPage } from '@/features/marketplace/pages/product-page';

export const Route = createFileRoute('/_app/marketplace/products/$slug/')({
  component: ProductPage,
});
