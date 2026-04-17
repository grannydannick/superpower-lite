// This component is used to define positions of floating elements throughout the application.
// In particular, it is used to position the assistant modal (Ask Superpower AI and on the AIAP the checkout modal).
// We render via a portal to document.body so the assistant modal stays interactive
// even when Radix modal dialogs mark #root as inert.

import { useRouterState } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

import { AssistantModal } from '@/features/messages/components/assistant/assistant-modal';

const HIDE_WRAPPER_PATHNAMES = [
  '/concierge',
  '/onboarding',
  '/questionnaire',
  '/protocol/reveal/welcome',
  '/protocol/reveal/text-sequence',
];

// Paths that require an exact match (e.g. the homepage has its own embedded
// chat bar, so the floating assistant is redundant there but should still
// render on nested routes).
const HIDE_WRAPPER_EXACT_PATHNAMES = ['/'];

export const FloatingWrapper = () => {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const containerRef = useRef<HTMLDivElement>(null);

  // Prevent Radix Dialog's FocusScope from stealing focus away from the
  // assistant modal when a modal dialog is open. FocusScope listens for
  // `focusin` and `focusout` on the document (bubble phase) to trap focus.
  // We stop `focusin` from bubbling out of our container, and intercept
  // `focusout` at the document capture phase when focus is moving into
  // our container — both prevent FocusScope from redirecting focus.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Stop focusin from bubbling past our container to document
    const stopFocusIn = (e: FocusEvent) => e.stopPropagation();
    el.addEventListener('focusin', stopFocusIn);

    // Intercept focusout at document level (capture phase) when focus is
    // moving TO our container — Radix's bubble-phase handler won't see it
    const interceptFocusOut = (e: FocusEvent) => {
      const relatedTarget = e.relatedTarget as Node | null;
      if (relatedTarget && el.contains(relatedTarget)) {
        e.stopImmediatePropagation();
      }
    };
    document.addEventListener('focusout', interceptFocusOut, true);

    return () => {
      el.removeEventListener('focusin', stopFocusIn);
      document.removeEventListener('focusout', interceptFocusOut, true);
    };
  }, []);

  let shouldHide = HIDE_WRAPPER_EXACT_PATHNAMES.includes(pathname);
  if (!shouldHide) {
    for (const segment of HIDE_WRAPPER_PATHNAMES) {
      if (pathname.includes(segment)) {
        shouldHide = true;
        break;
      }
    }
  }

  if (shouldHide) {
    return null;
  }

  return createPortal(
    <div
      ref={containerRef}
      className="pointer-events-none fixed bottom-24 right-4 z-[51] flex w-52 flex-col items-end gap-3 lg:bottom-4"
    >
      <AssistantModal />
    </div>,
    document.body,
  );
};
