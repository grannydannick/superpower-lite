import { parse } from 'shell-quote';

export interface ShellCommand {
  /** The command name (first token) */
  name: string;
  /** All arguments following the command name */
  args: string[];
  /** The full original command string for this segment */
  raw: string;
}

/**
 * Tokenize a bash command string into individual command segments.
 * Handles pipes, &&, ;, and subshells by splitting into separate commands.
 *
 * Example:
 *   "curl http://api/fhir/Observation | jq '.entry'"
 *   → [{ name: 'curl', args: ['http://api/fhir/Observation'] },
 *      { name: 'jq', args: ['.entry'] }]
 */
export function tokenizeShellCommands(input: string): ShellCommand[] {
  if (!input || typeof input !== 'string') return [];

  const commands: ShellCommand[] = [];

  try {
    const tokens = parse(input);
    let currentTokens: string[] = [];
    let currentRaw: string[] = [];

    const flushCommand = () => {
      if (currentTokens.length === 0) return;
      commands.push({
        name: currentTokens[0],
        args: currentTokens.slice(1),
        raw: currentRaw.join(' '),
      });
      currentTokens = [];
      currentRaw = [];
    };

    for (const token of tokens) {
      if (typeof token === 'string') {
        currentTokens.push(token);
        currentRaw.push(token);
      } else if (typeof token === 'object' && 'op' in token) {
        // Operators: |, &&, ;, ||
        flushCommand();
      }
      // Skip glob/pattern objects — treat as opaque
    }

    flushCommand();
  } catch {
    // If shell-quote fails, fall back to naive split
    const segments = input.split(/\s*(?:\|{1,2}|&&|;)\s*/);
    for (const segment of segments) {
      const parts = segment.trim().split(/\s+/);
      if (parts.length > 0 && parts[0]) {
        commands.push({
          name: parts[0],
          args: parts.slice(1),
          raw: segment.trim(),
        });
      }
    }
  }

  return commands;
}
