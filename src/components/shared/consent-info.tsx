import React, { forwardRef } from 'react';

import { cn } from '@/lib/utils';

export const ConsentInfo = forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement> & { className?: string }
>(({ className, htmlFor, ...props }, ref) => {
  return (
    <label
      htmlFor={htmlFor}
      {...props}
      ref={ref}
      className={cn(
        'text-sm leading-5 text-zinc-500 cursor-pointer',
        className,
      )}
    >
      By checking this box and confirming below, I acknowledge that I have read,
      understand, and agree to Superpower’s&nbsp;
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
      .&nbsp;Additionally, I acknowledge that I have reviewed, understand, and
      consent to the&nbsp;
      <a
        href="https://static.cloudhealthmedicalgroup.com/docs/Consent+for+Healthcare+Services+-+2024-05-13.pdf"
        className="cursor-pointer text-vermillion-900"
        target="_blank"
        rel="noreferrer"
      >
        Consent to Treatment
      </a>
      ,&nbsp;
      <a
        href="https://static.cloudhealthmedicalgroup.com/docs/Assignment+of+Benefits+-+2024-05-13.pdf"
        className="cursor-pointer text-vermillion-900"
        target="_blank"
        rel="noreferrer"
      >
        Assignment of Benefits Policy
      </a>
      , and&nbsp;
      <a
        href="https://bridge-static-files.s3.amazonaws.com/legal/Bridge_Privacy_Policy_2024-04-14.pdf"
        className="cursor-pointer text-vermillion-900"
        target="_blank"
        rel="noreferrer"
      >
        Data Privacy Statement
      </a>
      &nbsp;policies.
    </label>
  );
});

ConsentInfo.displayName = 'ConsentInfo';
