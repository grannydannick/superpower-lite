import React, { forwardRef } from 'react';

import { cn } from '@/lib/utils';

/**
 * Display heading Component
 *
 * This component renders a paragraph element (`<h1>`) with the following styles:
 *
 * - Color: #18181b (zinc-900)
 * - Font Family: "NB International Pro"
 * - Font Size: 128px
 * - Font Style: normal
 * - Font Weight: 400
 * - Line Height: 144px (112.5% of font size)
 * - Letter Spacing: -3.84px
 *
 * These styles align with the "Product Headings/Display heading" design specifications.
 *
 * Additional classes can be passed via the `className` prop to override or extend the default styling.
 *
 * @param {React.HTMLAttributes<HTMLParagraphElement>} props - The props for the paragraph element.
 * @param {React.Ref<HTMLParagraphElement>} ref - The ref to the paragraph element.
 * @returns {JSX.Element} The styled paragraph element.
 */
const DisplayH = forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>((props, ref) => {
  return (
    <h1
      {...props}
      ref={ref}
      className={cn(
        'text-9xl font-normal text-zinc-900 tracking-display-heading',
        props.className,
      )}
    >
      {props.children}
    </h1>
  );
});

DisplayH.displayName = 'DisplayH';
export { DisplayH };
