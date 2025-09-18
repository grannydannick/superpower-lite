import { UIMessage } from 'ai';

export function sanitizeUIMessages(
  messages: Array<UIMessage>,
): Array<UIMessage> {
  return messages.map((message) => {
    return {
      ...message,
      parts: message.parts.filter((part) => {
        if ('state' in part && part.state !== 'done') {
          return false;
        }
        return true;
      }),
    };
  });
}
