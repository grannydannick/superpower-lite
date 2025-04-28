import { Body1, H2 } from '@/components/ui/typography';

import { Button } from '../ui/button/button';

export const MainErrorFallback = () => {
  return (
    <div
      className="flex h-screen w-full flex-col items-center justify-center gap-6"
      role="alert"
    >
      <img src="/logo-dark.svg" className="h-auto w-[163px]" alt="logo" />
      <H2 className="text-center">Oops, something went wrong.</H2>
      <Body1 className="text-center text-zinc-500">
        Sorry, even our superpowers can’t handle this request
      </Body1>
      <Button
        className="mt-4"
        variant="outline"
        onClick={() => window.location.assign(window.location.origin)}
      >
        Refresh
      </Button>
    </div>
  );
};
