import { ReactNode } from 'react';

export const Disclaimer = ({ children }: { children: ReactNode }) => {
  return (
    <div className="space-y-2 rounded-lg bg-zinc-50 p-4 text-sm">
      <p>Disclaimer</p>
      {children}
    </div>
  );
};
