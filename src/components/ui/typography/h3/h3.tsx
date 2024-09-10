import React, { forwardRef } from 'react';

import { cn } from '@/lib/utils';

/**
 * Heading3 Component
 *
 * This component renders a heading element (`<h3>`) with the following styles:
 *
 * - Color: #18181b (zinc-900)
 * - Font Family: "NB International Pro"
 * - Font Size: 24px
 * - Font Style: normal
 * - Font Weight: 400
 * - Line Height: 32px (133.333% of font size)
 * - Letter Spacing: -0.48px
 *
 * These styles align with the "Product Headings/Heading 3" design specifications.
 *
 * Additional classes can be passed via the `className` prop to override or extend the default styling.
 *
 * @param {React.HTMLAttributes<HTMLHeadingElement>} props - The props for the heading element.
 * @param {React.Ref<HTMLHeadingElement>} ref - The ref to the heading element.
 * @returns {JSX.Element} The styled heading element.
 */
const H3 = forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>((props, ref) => {
  return (
    <h3
      {...props}
      ref={ref}
      className={cn(
        'text-xl md:text-2xl tracking-[-0.48px] text-zinc-900 font-normal',
        props.className,
      )}
    >
      {props.children}
    </h3>
  );
});

H3.displayName = 'H3';
export { H3 };
