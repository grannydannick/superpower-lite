import { Eye, EyeOff } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon: React.ReactNode;
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
          'flex border border-input items-center p-4 gap-3',
          variant === 'connected'
            ? border === 'top'
              ? 'rounded-t-lg border-b-0'
              : 'rounded-b-lg'
            : 'rounded-lg',
        )}
      >
        <div className="">{icon}</div>
        <input
          autoCapitalize="off"
          type={
            type === 'password' ? (showPassword ? 'text' : 'password') : type
          }
          className={cn(
            'flex w-full caret-vermillion-900 p-0 text-base transition-colors placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none',
            className,
          )}
          ref={ref}
          {...props}
        />
        {type === 'password' && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="text-zinc-400 hover:text-zinc-600 focus:outline-none"
          >
            {showPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        )}
      </div>
    );
  },
);
AuthInput.displayName = 'AuthInput';

export { AuthInput };
