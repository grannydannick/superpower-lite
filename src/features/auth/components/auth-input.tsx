import { Eye } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  border: 'top' | 'bottom';
  variant?: 'connected' | 'individual';
}

const AuthInput = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, icon, type, border = 'top', variant = 'connected', ...props },
    ref,
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    return (
      <div
        className={cn(
          'flex border relative border-input items-center',
          variant === 'connected'
            ? border === 'top'
              ? 'rounded-t-xl border-b-0'
              : 'rounded-b-xl'
            : variant === 'individual'
              ? 'rounded-xl shadow-sm transition-all duration-150 gap-3 h-14'
              : 'rounded-xl',
        )}
      >
        {icon && <div className="pl-4">{icon}</div>}
        <input
          autoCapitalize="off"
          type={
            type === 'password' ? (showPassword ? 'text' : 'password') : type
          }
          className={cn(
            'flex w-full rounded-xl caret-vermillion-900 p-4 text-base transition-colors placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none',
            // Distinguish between connected and individual variants - individual ones should act like default inputs
            variant === 'individual' &&
              'flex absolute inset-0 w-full caret-vermillion-900 py-5 px-6 rounded-xl text-base transition-all duration-150 placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:bg-zinc-50 focus-visible:ring-2 focus-visible:ring-ring',
            className,
          )}
          ref={ref}
          {...props}
        />
        {type === 'password' && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="group absolute right-5 z-10 text-zinc-400 transition-colors hover:text-zinc-600 focus:outline-none"
          >
            <div
              className={cn(
                'absolute left-1/2 top-1/2 w-[1.5px] -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-full bg-zinc-400 outline outline-2 outline-white transition-all group-hover:bg-zinc-600',
                showPassword ? 'h-0 opacity-0' : 'h-4',
              )}
            />
            <Eye className="size-4" />
          </button>
        )}
      </div>
    );
  },
);
AuthInput.displayName = 'AuthInput';

export { AuthInput };
