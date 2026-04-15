import { tokenizeShellCommands, type ShellCommand } from './shell-tokenize';

// ============================================================================
// Action Types
// ============================================================================

export interface FhirQueryAction {
  type: 'fhir-query';
  resourceType?: string;
}

export interface MarketplaceQueryAction {
  type: 'marketplace-query';
  query?: string;
  handle?: string;
}

export interface MemorySaveAction {
  type: 'memory-save';
}

export interface MemoryReadAction {
  type: 'memory-read';
}

export interface SkillReadAction {
  type: 'skill-read';
  skillName: string;
}

export interface KbSearchAction {
  type: 'kb-search';
  query?: string;
}

export interface FileReadAction {
  type: 'file-read';
  path: string;
}

export type BashToolAction =
  | FhirQueryAction
  | MarketplaceQueryAction
  | MemorySaveAction
  | MemoryReadAction
  | SkillReadAction
  | KbSearchAction
  | FileReadAction;

/**
 * An entry in the reasoning timeline — either a text paragraph or a tool action.
 * Used to interleave reasoning text with tool calls in the correct order.
 */
export interface BiomarkerBadge {
  name: string;
  status: string;
  showDot?: boolean;
}

export type ReasoningEntry =
  | { kind: 'text'; text: string }
  | { kind: 'action'; action: BashToolAction }
  | { kind: 'biomarkers'; items: BiomarkerBadge[] };

// ============================================================================
// Matchers — ordered by specificity (most specific first)
// ============================================================================

/**
 * Match `retain "..."` — memory save
 */
function matchMemorySave(cmd: ShellCommand): MemorySaveAction | null {
  if (cmd.name === 'retain') {
    return { type: 'memory-save' };
  }
  return null;
}

/**
 * Match `recall` or `recall "query..."` — memory read
 */
function matchMemoryRead(cmd: ShellCommand): MemoryReadAction | null {
  if (cmd.name === 'recall') {
    return { type: 'memory-read' };
  }
  return null;
}

/**
 * Match `fhir ...` CLI command or FHIR URL patterns
 */
function matchFhirQuery(cmd: ShellCommand): FhirQueryAction | null {
  // CLI: `fhir Observation/uuid` or `fhir CarePlan/uuid`
  if (cmd.name === 'fhir') {
    const resourceArg = cmd.args[0];
    const resourceType = resourceArg?.match(/^([A-Z][a-zA-Z]+)/)?.[1];
    return { type: 'fhir-query', resourceType };
  }

  // URL pattern: /fhir/ResourceType or fhir://ResourceType
  const allTokens = [cmd.name, ...cmd.args];
  for (const token of allTokens) {
    const match = token.match(
      /\/fhir(?:\/r4)?\/([A-Z][a-zA-Z]+)|fhir:\/\/([A-Z][a-zA-Z]+)/,
    );
    if (match) {
      return { type: 'fhir-query', resourceType: match[1] ?? match[2] };
    }
  }

  return null;
}

/**
 * Match `kb "query..."` — knowledge base search
 */
function matchKbSearch(cmd: ShellCommand): KbSearchAction | null {
  if (cmd.name === 'kb') {
    return { type: 'kb-search', query: cmd.args[0] };
  }
  return null;
}

/**
 * Match `marketplace ...` CLI command or marketplace URL patterns
 */
function matchMarketplaceQuery(
  cmd: ShellCommand,
): MarketplaceQueryAction | null {
  if (cmd.name === 'marketplace') {
    const handle = cmd.args[0];
    return { type: 'marketplace-query', handle };
  }

  // URL patterns
  const allTokens = [cmd.name, ...cmd.args];
  for (const token of allTokens) {
    if (
      token.match(/\/marketplace|\/products?\/[a-z0-9-]+|product:\/\/[^\s'"]+/i)
    ) {
      const handleMatch = token.match(
        /\/products?\/([a-z0-9-]+)|product:\/\/([^\s'"]+)/i,
      );
      return {
        type: 'marketplace-query',
        handle: handleMatch?.[1] ?? handleMatch?.[2],
      };
    }
  }

  return null;
}

/**
 * Match `cat /skills/<name>/SKILL.md` — reading a skill file.
 * These are the model loading skill instructions before using them.
 */
function matchSkillRead(cmd: ShellCommand): SkillReadAction | null {
  if (cmd.name === 'cat') {
    const path = cmd.args[0] ?? '';
    const skillMatch = path.match(/\/skills\/([a-z0-9_-]+)\//i);
    if (skillMatch) {
      return { type: 'skill-read', skillName: skillMatch[1] };
    }
  }
  return null;
}

/**
 * Match `cat <path>` for non-skill file reads.
 * Only matches if it's not a skill file (those are caught by matchSkillRead).
 */
function matchFileRead(cmd: ShellCommand): FileReadAction | null {
  if (cmd.name === 'cat') {
    const path = cmd.args[0] ?? '';
    // Skip skill files (handled by matchSkillRead)
    if (path.match(/\/skills\//i)) return null;
    if (path) {
      return { type: 'file-read', path };
    }
  }
  return null;
}

// ============================================================================
// Main Parser
// ============================================================================

// Ordered by specificity — skill-read before file-read
const MATCHERS = [
  matchMemorySave,
  matchMemoryRead,
  matchFhirQuery,
  matchKbSearch,
  matchMarketplaceQuery,
  matchSkillRead,
  matchFileRead,
] as const;

/**
 * Parse a bash tool command string and extract all identifiable actions.
 * Returns an array of actions found in the command — may contain multiple
 * actions if the command chains multiple operations (pipes, &&, etc.).
 */
export function parseBashToolActions(command: string): BashToolAction[] {
  if (!command || typeof command !== 'string') return [];

  const shellCommands = tokenizeShellCommands(command);
  const actions: BashToolAction[] = [];

  for (const cmd of shellCommands) {
    for (const matcher of MATCHERS) {
      const action = matcher(cmd);
      if (action) {
        actions.push(action);
        break; // One action per command segment
      }
    }
  }

  return actions;
}

// ============================================================================
// Display Helpers
// ============================================================================

/** Human-readable label for a single action */
export function formatActionLabel(action: BashToolAction): string {
  switch (action.type) {
    case 'fhir-query':
      return action.resourceType
        ? `Queried FHIR ${action.resourceType}`
        : 'Queried health records';
    case 'marketplace-query':
      return action.handle
        ? `Looked up product: ${action.handle}`
        : 'Searched marketplace';
    case 'memory-save':
      return 'Saved memory';
    case 'memory-read':
      return 'Recalled memory';
    case 'skill-read':
      return 'Reading skill';
    case 'kb-search':
      return action.query
        ? `Searched knowledge base`
        : 'Searched knowledge base';
    case 'file-read':
      return `Read file`;
  }
}
