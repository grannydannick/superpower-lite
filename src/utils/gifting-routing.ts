import { env } from '@/config/env';

export function buildGiftCheckoutUrl(
  source: 'onboarding' | 'app' = 'app',
  email?: string,
) {
  const checkoutUrl = new URL('/checkout/gift', env.WEBSITE_URL);

  checkoutUrl.searchParams.set('source', source);

  if (email != null) {
    checkoutUrl.searchParams.set('email', email);
  }

  return checkoutUrl.toString();
}
