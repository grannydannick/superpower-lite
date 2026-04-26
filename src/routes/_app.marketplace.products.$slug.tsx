import { Outlet, createFileRoute } from '@tanstack/react-router';

import { ProductProvider } from '@/features/marketplace/contexts/product-context';

export const Route = createFileRoute('/_app/marketplace/products/$slug')({
  component: ProductLayoutComponent,
});

function ProductLayoutComponent() {
  const { slug } = Route.useParams();

  return (
    <ProductProvider slug={slug}>
      <Outlet />
    </ProductProvider>
  );
}
