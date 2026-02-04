/**
 * Safely stringify a value to JSON, handling undefined and errors
 */
export function safeJsonStringify(value: unknown): string {
  try {
    return value === undefined ? '' : JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

/**
 * Format text as JSON if it's valid JSON, otherwise return as-is
 */
export function formatJsonIfValid(text: string): string {
  try {
    const parsed = JSON.parse(text);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return text;
  }
}
