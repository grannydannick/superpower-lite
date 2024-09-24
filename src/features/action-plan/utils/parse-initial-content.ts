import { DEFAULT_CONTENT } from '../const/default-content';

export const parseInitialContent = (initialContent: string) => {
  try {
    const parsedContent = JSON.parse(initialContent);
    if (parsedContent && typeof parsedContent === 'object') {
      return parsedContent;
    }
  } catch (error) {
    console.warn(
      'Failed to parse initial content as JSON. Using fallback content.',
    );
  }

  // Fallback for legacy users: replace defaultContent's text with initialContent
  return {
    ...DEFAULT_CONTENT,
    content: DEFAULT_CONTENT.content.map((block) => {
      if (block.type === 'paragraph' && block.content) {
        return {
          ...block,
          content: block.content.map((child) =>
            child.type === 'text'
              ? { ...child, text: initialContent || 'Default fallback text' }
              : child,
          ),
        };
      }
      return block;
    }),
  };
};
