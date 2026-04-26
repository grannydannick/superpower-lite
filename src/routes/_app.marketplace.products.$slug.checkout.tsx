import { createFileRoute } from '@tanstack/react-router';

import { CheckoutPage } from '@/features/marketplace/pages/product-page/checkout';

export const Route = createFileRoute(
  '/_app/marketplace/products/$slug/checkout',
)({
  component: CheckoutComponent,
});

function CheckoutComponent() {
  const { slug } = Route.useParams();
  const navigate = Route.useNavigate();

  return (
    <CheckoutPage
      slug={slug}
      onClose={() =>
        void navigate({ to: '/marketplace/products/$slug', params: { slug } })
      }
    />
  );
}
