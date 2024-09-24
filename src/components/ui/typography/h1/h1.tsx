import React, { forwardRef } from 'react';

import { cn } from '@/lib/utils';

/**
 * Heading1 Component
 *
 * This component renders a heading element (`<h1>`) with the following styles:
 *
 * - Color: #18181b (zinc-900)
 * - Font Family: "NB International Pro"
 * - Font Size: 64px
 * - Font Style: normal
 * - Font Weight: 400
 * - Line Height: 72px (112.5% of font size)
 * - Letter Spacing: -1.6px
 *
 * These styles align with the "Product Headings/heading 1" design specifications.
 *
 * Additional classes can be passed via the `className` prop to override or extend the default styling.
 *
 * @param {React.HTMLAttributes<HTMLHeadingElement>} props - The props for the heading element.
 * @param {React.Ref<HTMLHeadingElement>} ref - The ref to the heading element.
 * @returns {JSX.Element} The styled heading element.
 */
const H1 = forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>((props, ref) => {
  return (
    <h1
      {...props}
      ref={ref}
      className={cn(
        'text-3xl md:text-6xl tracking-[-1.6px] text-zinc-900 font-normal',
        props.className,
      )}
    >
      {props.children}
    </h1>
  );
});

H1.displayName = 'H1';
export { H1 };
