import React, { forwardRef } from 'react';

import { cn } from '@/lib/utils';

/**
 * Body2 Component
 *
 * This component renders a paragraph element (`<p>`) with the following styles:
 *
 * - Color: #18181b (zinc-900)
 * - Font Family: "NB International Pro"
 * - Font Size: 14px
 * - Font Style: normal
 * - Font Weight: 400
 * - Line Height: 20px (142.857% of font size)
 *
 * These styles align with the "Product Body/Body 2" design specifications.
 *
 * Additional classes can be passed via the `className` prop to override or extend the default styling.
 *
 * @param {React.HTMLAttributes<HTMLParagraphElement>} props - The props for the paragraph element.
 * @param {React.Ref<HTMLParagraphElement>} ref - The ref to the paragraph element.
 * @returns {React.ReactElement} The styled paragraph element.
 */

const Body2 = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>((props, ref) => {
  return (
    <p
      {...props}
      ref={ref}
      className={cn('text-sm font-normal text-zinc-900', props.className)}
    >
      {props.children}
    </p>
  );
});

Body2.displayName = 'Body2';
export { Body2 };
