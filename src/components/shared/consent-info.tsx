import React, { forwardRef } from 'react';

import { cn } from '@/lib/utils';

export const ConsentInfo = forwardRef<
  HTMLLabelElement,
  React.HTMLAttributes<HTMLLabelElement> & { className?: string }
>(({ className, ...props }, ref) => {
  return (
    <label
      {...props}
      ref={ref}
      className={cn('text-sm leading-5 text-zinc-500', className)}
    >
      I agree to Superpower’s{' '}
      <a
        href="https://superpower.com/terms"
        target="_blank"
        className="cursor-pointer text-vermillion-900"
        rel="noreferrer"
      >
        Terms of Service
      </a>
      , and acknowledge the{' '}
      <a
        href="https://superpower.com/privacy"
        target="_blank"
        className="cursor-pointer text-vermillion-900"
        rel="noreferrer"
      >
        Privacy Policy
      </a>
      ,{' '}
      <a
        href="https://static.cloudhealthmedicalgroup.com/docs/Assignment+of+Benefits+-+2024-05-13.pdf"
        className="cursor-pointer text-vermillion-900"
        target="_blank"
        rel="noreferrer"
      >
        Assignment of Benefits Policy
      </a>
      ,{' '}
      <a
        href="https://static.cloudhealthmedicalgroup.com/docs/Consent+for+Healthcare+Services+-+2024-05-13.pdf"
        className="cursor-pointer text-vermillion-900"
        target="_blank"
        rel="noreferrer"
      >
        Consent to Treatment
      </a>
      , and{' '}
      <a
        href="https://bridge-static-files.s3.amazonaws.com/legal/Bridge_Privacy_Policy_2024-04-14.pdf"
        className="cursor-pointer text-vermillion-900"
        target="_blank"
        rel="noreferrer"
      >
        Data Privacy Statement
      </a>
      .
    </label>
  );
});

ConsentInfo.displayName = 'ConsentInfo';
