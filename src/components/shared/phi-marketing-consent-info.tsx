import React, { forwardRef } from 'react';

import { cn } from '@/lib/utils';

export const PhiMarketingConsentInfo = forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement> & { className?: string }
>(({ className, htmlFor, children, ...props }, ref) => {
  return (
    <label
      htmlFor={htmlFor}
      {...props}
      ref={ref}
      className={cn(
        'cursor-pointer text-sm leading-5 text-zinc-500',
        className,
      )}
    >
      {children ? (
        children
      ) : (
        <>
          I agree to receive personalized offers & reminders based on my Action
          Plan & Lab results. I consent to Superpower using my health data for
          this. Opt out anytime.
        </>
      )}
    </label>
  );
});

PhiMarketingConsentInfo.displayName = 'PhiMarketingConsentInfo';
