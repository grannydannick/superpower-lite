import { createFileRoute, redirect } from '@tanstack/react-router';

import { env } from '@/config/env';

export const Route = createFileRoute('/register')({
  beforeLoad: ({ location }) => {
    const dest = new URL('/register', env.WEBSITE_URL);
    const search = new URLSearchParams(location.searchStr);
    search.forEach((value, key) => dest.searchParams.set(key, value));
    throw redirect({ href: dest.toString(), replace: true });
  },
});
