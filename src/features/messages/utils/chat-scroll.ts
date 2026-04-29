// DOM id of the AI chat's scroll container (rendered in messages.tsx).
// Exported so the `useChatScroll` hook can subscribe to the same element.
export const CHAT_SCROLL_CONTAINER_ID = 'ai-chat-scroll-container';

// Space preserved between the bottom of the scrolled-to message and the
// bottom of the scroll container. Enough for the message's action buttons
// (thumbs up/down) to sit clear of the input's fade mask.
const SCROLL_TO_MESSAGE_BOTTOM_GAP_PX = 48;

type ScrollToBottomOptions = {
  behavior?: ScrollBehavior;
  /**
   * If true, scroll on the current frame. Default: false — the call is
   * deferred via double-rAF so any pending React renders / layout effects
   * from preceding state changes have flushed first.
   */
  immediate?: boolean;
};

/**
 * Imperatively scroll the chat to the bottom of its scroll container.
 * Safe to call from event handlers and effects outside React rendering.
 */
export function scrollChatToBottom(options: ScrollToBottomOptions = {}) {
  const { behavior = 'smooth', immediate = false } = options;
  const doScroll = () => {
    const el = document.getElementById(CHAT_SCROLL_CONTAINER_ID);
    if (el == null) {
      return;
    }

    el.scrollTo({ top: el.scrollHeight, behavior });
  };
  if (immediate) {
    doScroll();
    return;
  }
  requestAnimationFrame(() => requestAnimationFrame(doScroll));
}

type ScrollToMessageOptions = {
  behavior?: ScrollBehavior;
  block?: 'start' | 'center' | 'end';
  /**
   * For `block: 'end'` — pixels preserved between the message's bottom
   * edge and the scroll container's bottom (e.g. to keep the message's
   * action row clear of the input fade). Defaults to 48 for
   * `block: 'end'`, 0 otherwise.
   */
  bottomGapPx?: number;
};

/**
 * Imperatively scroll a rendered `message-<id>` element into view.
 * - `block: 'end'` uses `scrollBy` so we can preserve `bottomGapPx` above
 *   the container's bottom edge.
 * - Other blocks use native `scrollIntoView`.
 */
export function scrollChatToMessage(
  messageId: string,
  options: ScrollToMessageOptions = {},
) {
  const { behavior = 'smooth', block = 'end' } = options;
  const bottomGapPx =
    options.bottomGapPx ??
    (block === 'end' ? SCROLL_TO_MESSAGE_BOTTOM_GAP_PX : 0);

  const container = document.getElementById(CHAT_SCROLL_CONTAINER_ID);
  const target = document.getElementById(`message-${messageId}`);
  if (container == null || target == null) {
    return;
  }

  if (block === 'end' && bottomGapPx > 0) {
    const targetRect = target.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const delta = targetRect.bottom - containerRect.bottom + bottomGapPx;
    container.scrollBy({ top: delta, behavior });
    return;
  }

  target.scrollIntoView({ behavior, block });
}
