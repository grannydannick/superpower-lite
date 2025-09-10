import React, { forwardRef } from 'react';

import { cn } from '@/lib/utils';

type Body1Props = React.HTMLAttributes<HTMLParagraphElement> & {
  as?: 'p' | 'div' | 'span';
};

/**
 * Body1 Component
 *
 * This component renders a paragraph element (`<p>`) with the following styles:
 *
 * - Color: #18181b (zinc-900)
 * - Font Family: "NB International Pro"
 * - Font Size: 16px
 * - Font Style: normal
 * - Font Weight: 400
 * - Line Height: 24px (150% of font size)
 *
 * These styles align with the "Product Body/Body 1" design specifications.
 *
 * Additional classes can be passed via the `className` prop to override or extend the default styling.
 * The `as` prop allows you to render as different HTML elements (p, div, span) while maintaining the same styling.
 *
 * @param {Body1Props} props - The props for the element.
 * @param {React.Ref<HTMLParagraphElement | HTMLDivElement | HTMLSpanElement>} ref - The ref to the element.
 * @returns {JSX.Element} The styled element.
 */
const Body1 = forwardRef<
  HTMLParagraphElement | HTMLDivElement | HTMLSpanElement,
  Body1Props
>(({ as = 'p', ...props }, ref) => {
  const Component = as;

  return (
    <Component
      {...props}
      ref={ref as any}
      className={cn('text-base text-zinc-900', props.className)}
    >
      {props.children}
    </Component>
  );
});

Body1.displayName = 'Body1';
export { Body1 };
