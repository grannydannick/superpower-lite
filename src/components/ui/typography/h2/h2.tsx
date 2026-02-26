import React, { forwardRef } from 'react';

import { cn } from '@/lib/utils';

/**
 * Heading2 Component
 *
 * This component renders a heading element (`<h2>`) with the following styles:
 *
 * - Color: #18181b (zinc-900)
 * - Font Family: "NB International Pro"
 * - Font Size: 32px
 * - Font Style: normal
 * - Font Weight: 400
 * - Line Height: 40px (125% of font size)
 * - Letter Spacing: -0.64px
 *
 * These styles align with the "Product Headings/heading 2" design specifications.
 *
 * Additional classes can be passed via the `className` prop to override or extend the default styling.
 *
 * @param {React.HTMLAttributes<HTMLHeadingElement>} props - The props for the heading element.
 * @param {React.Ref<HTMLHeadingElement>} ref - The ref to the heading element.
 * @returns {React.ReactElement} The styled heading element.
 */

const H2 = forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>((props, ref) => {
  return (
    <h2
      {...props}
      ref={ref}
      className={cn(
        'text-2xl font-normal tracking-[-0.64px] text-zinc-900 md:text-3xl',
        props.className,
      )}
    >
      {props.children}
    </h2>
  );
});

H2.displayName = 'H2';
export { H2 };
