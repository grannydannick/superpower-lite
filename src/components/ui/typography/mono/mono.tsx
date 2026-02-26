import React, { forwardRef } from 'react';

import { cn } from '@/lib/utils';

/**
 * Mono Component
 *
 * This component renders a paragraph element (`<p>`) with the following styles:
 *
 * - Color: #18181b (zinc-900)
 * - Font Family: "NB International Pro"
 * - Font Size: 12px
 * - Font Style: normal
 * - Font Weight: 400
 * - Line Height: 16px (133.333% of font size)
 * - Text Transform: uppercase
 *
 * These styles align with the "Product Body/Mono" design specifications.
 *
 * Additional classes can be passed via the `className` prop to override or extend the default styling.
 *
 * @param {React.HTMLAttributes<HTMLParagraphElement>} props - The props for the paragraph element.
 * @param {React.Ref<HTMLParagraphElement>} ref - The ref to the paragraph element.
 * @returns {React.ReactElement} The styled paragraph element.
 */
const Mono = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>((props, ref) => {
  return (
    <p
      {...props}
      ref={ref}
      className={cn(
        'font-mono text-xs font-normal uppercase text-zinc-900',
        props.className,
      )}
    >
      {props.children}
    </p>
  );
});

Mono.displayName = 'Mono';
export { Mono };
