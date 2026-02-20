import React, { forwardRef } from 'react';

import { cn } from '@/lib/utils';

/**
 * Body4 Component
 *
 * This component renders a paragraph element (`<p>`) with the following styles:
 *
 * - Color: #18181b (zinc-900)
 * - Font Family: "NB International Pro"
 * - Font Size: 10px
 * - Font Style: normal
 * - Font Weight: 400
 * - Line Height: 12px (120% of font size)
 *
 * These styles align with the "Product Body/Body 4" design specifications.
 *
 * Additional classes can be passed via the `className` prop to override or extend the default styling.
 *
 * @param {React.HTMLAttributes<HTMLParagraphElement>} props - The props for the paragraph element.
 * @param {React.Ref<HTMLParagraphElement>} ref - The ref to the paragraph element.
 * @returns {JSX.Element} The styled paragraph element.
 */
const Body4 = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>((props, ref) => {
  return (
    <p
      {...props}
      ref={ref}
      className={cn(
        'text-[10px] font-normal leading-3 text-zinc-900',
        props.className,
      )}
    >
      {props.children}
    </p>
  );
});

Body4.displayName = 'Body4';
export { Body4 };
