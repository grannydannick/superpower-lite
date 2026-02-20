import { Eye } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'individual' | 'error';
}

const AuthInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = 'individual', ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);

    const togglePasswordVisibility = () => setShowPassword((v) => !v);

    const isPassword = type === 'password';

    return (
      <div
        className={cn(
          'relative flex items-center rounded-xl border border-input',
          variant === 'individual' &&
            'h-14 gap-3 shadow-sm transition-all duration-150',
          variant === 'error' &&
            'border-pink-700 bg-pink-50 transition-none duration-0 focus-within:ring-1 focus-within:ring-pink-700',
        )}
      >
        <input
          autoCapitalize="off"
          type={
            type === 'password' ? (showPassword ? 'text' : 'password') : type
          }
          className={cn(
            'flex w-full rounded-xl px-6 py-4 text-base caret-vermillion-900 transition-colors placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
            // Distinguish between connected and individual variants - individual ones should act like default inputs
            variant === 'individual' &&
              'absolute inset-0 flex w-full rounded-xl text-base caret-vermillion-900 transition-all duration-150 placeholder:text-muted-foreground focus-visible:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
            variant === 'error' &&
              'border-pink-700 bg-pink-50 caret-vermillion-900 transition-none duration-0 placeholder:text-pink-700 focus-visible:bg-pink-50 focus-visible:ring-pink-700',
            className,
          )}
          ref={ref}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="group absolute right-5 z-10 text-zinc-400 transition-colors hover:text-zinc-600 focus:outline-none"
          >
            <div
              className={cn(
                'absolute left-1/2 top-1/2 w-[1.5px] -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-full bg-zinc-400 outline outline-2 transition-all group-hover:bg-zinc-600',
                variant === 'error' ? 'outline-pink-50' : 'outline-white',
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
