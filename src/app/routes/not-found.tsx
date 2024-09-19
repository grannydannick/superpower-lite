import { Button } from '@/components/ui/button';
import { Body1, H1 } from '@/components/ui/typography';

export const NotFoundRoute = () => {
  return (
    <div
      className="flex h-screen w-full flex-col items-center justify-center gap-6 p-4"
      role="alert"
    >
      <img src="/logo-dark.svg" className="h-auto w-[163px]" alt="logo" />
      <H1 className="text-center">Page not found.</H1>
      <Body1 className="text-center text-zinc-500">
        Sorry, even our superpowers can’t locate this page or the page you are
        looking for no longer exists
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
