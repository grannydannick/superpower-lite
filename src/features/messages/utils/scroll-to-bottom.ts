export function scrollToBottom(options?: {
  immediate?: boolean;
  behavior?: ScrollBehavior;
}) {
  const { immediate = false, behavior = 'smooth' } = options ?? {};
  const doScroll = () => {
    const el = document.getElementById('ai-chat-scroll-container');
    if (!el) return false;
    el.scrollTo({ top: el.scrollHeight, behavior });
    return true;
  };

  if (immediate) return doScroll();

  // defer until after navigation/layout to ensure element exists and has size
  requestAnimationFrame(() => requestAnimationFrame(doScroll));
  return true;
}
