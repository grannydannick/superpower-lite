import { UIMessage } from 'ai';

export function getLastMessageByRole(
  messages: UIMessage[] | undefined | null,
  role: 'user' | 'assistant',
): string | null {
  if (!messages || messages.length === 0) return null;
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m.role === role && m.parts) {
      const part = m.parts.find((p) => p.type === 'text');
      if (part && part.type === 'text' && part.text && part.text.trim()) {
        return part.text;
      }
    }
  }
  return null;
}

export function getLastUserMessage(
  messages: UIMessage[] | undefined | null,
): string | null {
  return getLastMessageByRole(messages, 'user');
}

export function getLastAiMessage(
  messages: UIMessage[] | undefined | null,
): string | null {
  return getLastMessageByRole(messages, 'assistant');
}
