import React, { forwardRef } from 'react';

import { cn } from '@/lib/utils';

export const ConsentInfo = forwardRef<
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
          By checking this box and confirming below, I acknowledge that I have
          read, understand, and agree to Superpower’s&nbsp;
          <a
            href="https://superpower.com/terms"
            target="_blank"
            className="cursor-pointer text-vermillion-900"
            rel="noreferrer"
          >
            Terms of Service
          </a>
          ,&nbsp;
          <a
            href="https://superpower.com/medical-consent"
            target="_blank"
            className="cursor-pointer text-vermillion-900"
            rel="noreferrer"
          >
            Informed Medical Consent
          </a>
          ,&nbsp;
          <a
            href="https://superpower.com/legal/membership"
            target="_blank"
            className="cursor-pointer text-vermillion-900"
            rel="noreferrer"
          >
            Membership Agreement
          </a>
          ,&nbsp;
          <a
            href="https://superpower.com/privacy"
            target="_blank"
            className="cursor-pointer text-vermillion-900"
            rel="noreferrer"
          >
            Privacy Policy
          </a>
          &nbsp;and&nbsp;
          <a
            href="https://superpower.com/medical-privacy-practices"
            className="cursor-pointer text-vermillion-900"
            target="_blank"
            rel="noreferrer"
          >
            Notice of Medical Group Privacy Practices
          </a>
          .&nbsp;
        </>
      )}
    </label>
  );
});

ConsentInfo.displayName = 'ConsentInfo';
