import React, { forwardRef } from 'react';

import { cn } from '@/lib/utils';

/**
 * Heading4 Component
 *
 * This component renders a heading element (`<h4>`) with the following styles:
 *
 * - Color: #18181b (zinc-900)
 * - Font Family: "NB International Pro"
 * - Font Size: 20px
 * - Font Style: normal
 * - Font Weight: 400
 * - Line Height: 28px (140% of font size)
 * - Letter Spacing: -0.2px
 *
 * These styles align with the "Product Headings/heading 4" design specifications.
 *
 * Additional classes can be passed via the `className` prop to override or extend the default styling.
 *
 * @param {React.HTMLAttributes<HTMLHeadingElement>} props - The props for the heading element.
 * @param {React.Ref<HTMLHeadingElement>} ref - The ref to the heading element.
 * @returns {JSX.Element} The styled heading element.
 */
const H4 = forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>((props, ref) => {
  return (
    <h4
      {...props}
      ref={ref}
      className={cn(
        'text-xl font-normal tracking-[-0.2px] text-zinc-900',
        props.className,
      )}
    >
      {props.children}
    </h4>
  );
});

H4.displayName = 'H4';
export { H4 };
