import { describe, expect, it } from 'vitest';

import {
  formatActionLabel,
  parseBashToolActions,
  type ReasoningEntry,
} from '../parse-bash-tool-actions';
import { tokenizeShellCommands } from '../shell-tokenize';

// ============================================================================
// Shell Tokenizer
// ============================================================================

describe('tokenizeShellCommands', () => {
  it('returns empty array for empty input', () => {
    expect(tokenizeShellCommands('')).toEqual([]);
    expect(tokenizeShellCommands(null as unknown as string)).toEqual([]);
  });

  it('tokenizes a simple command', () => {
    const result = tokenizeShellCommands('recall');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('recall');
    expect(result[0].args).toEqual([]);
  });

  it('handles quoted strings with spaces', () => {
    const result = tokenizeShellCommands(
      'recall "How has @User been sleeping?"',
    );
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('recall');
    expect(result[0].args).toContain('How has @User been sleeping?');
  });

  it('tokenizes cat with a path', () => {
    const result = tokenizeShellCommands('cat /skills/memory-recall/SKILL.md');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('cat');
    expect(result[0].args).toEqual(['/skills/memory-recall/SKILL.md']);
  });
});

// ============================================================================
// Memory Operations
// ============================================================================

describe('parseBashToolActions — memory operations', () => {
  it('detects retain as memory save', () => {
    const actions = parseBashToolActions(
      'retain "W ^2026-04-06 @User asked about malabsorption #health"',
    );
    expect(actions).toHaveLength(1);
    expect(actions[0].type).toBe('memory-save');
  });

  it('detects recall as memory read', () => {
    const actions = parseBashToolActions('recall');
    expect(actions).toHaveLength(1);
    expect(actions[0].type).toBe('memory-read');
  });

  it('detects recall with query as memory read', () => {
    const actions = parseBashToolActions(
      'recall "How has @User been sleeping? #sleep"',
    );
    expect(actions).toHaveLength(1);
    expect(actions[0].type).toBe('memory-read');
  });
});

// ============================================================================
// FHIR Queries
// ============================================================================

describe('parseBashToolActions — FHIR queries', () => {
  it('detects fhir CLI command', () => {
    const actions = parseBashToolActions('fhir Observation/abc-123');
    expect(actions).toHaveLength(1);
    expect(actions[0].type).toBe('fhir-query');
    if (actions[0].type === 'fhir-query') {
      expect(actions[0].resourceType).toBe('Observation');
    }
  });

  it('detects fhir CLI with CarePlan', () => {
    const actions = parseBashToolActions('fhir CarePlan/xyz');
    expect(actions).toHaveLength(1);
    if (actions[0].type === 'fhir-query') {
      expect(actions[0].resourceType).toBe('CarePlan');
    }
  });
});

// ============================================================================
// Knowledge Base
// ============================================================================

describe('parseBashToolActions — knowledge base', () => {
  it('detects kb search', () => {
    const actions = parseBashToolActions(
      'kb "Does Superpower help with specialist referrals?"',
    );
    expect(actions).toHaveLength(1);
    expect(actions[0].type).toBe('kb-search');
    if (actions[0].type === 'kb-search') {
      expect(actions[0].query).toBe(
        'Does Superpower help with specialist referrals?',
      );
    }
  });
});

// ============================================================================
// Marketplace
// ============================================================================

describe('parseBashToolActions — marketplace', () => {
  it('detects marketplace CLI command', () => {
    const actions = parseBashToolActions('marketplace omega-3-fish-oil');
    expect(actions).toHaveLength(1);
    expect(actions[0].type).toBe('marketplace-query');
    if (actions[0].type === 'marketplace-query') {
      expect(actions[0].handle).toBe('omega-3-fish-oil');
    }
  });
});

// ============================================================================
// Skill Reading
// ============================================================================

describe('parseBashToolActions — skill reading', () => {
  it('detects cat of a skill file', () => {
    const actions = parseBashToolActions('cat /skills/memory-recall/SKILL.md');
    expect(actions).toHaveLength(1);
    expect(actions[0].type).toBe('skill-read');
    if (actions[0].type === 'skill-read') {
      expect(actions[0].skillName).toBe('memory-recall');
    }
  });

  it('detects cat of fhir skill file', () => {
    const actions = parseBashToolActions('cat /skills/fhir/SKILL.md');
    expect(actions).toHaveLength(1);
    if (actions[0].type === 'skill-read') {
      expect(actions[0].skillName).toBe('fhir');
    }
  });

  it('detects cat of kb skill file', () => {
    const actions = parseBashToolActions('cat /skills/kb/SKILL.md');
    expect(actions).toHaveLength(1);
    if (actions[0].type === 'skill-read') {
      expect(actions[0].skillName).toBe('kb');
    }
  });
});

// ============================================================================
// File Reading
// ============================================================================

describe('parseBashToolActions — file reading', () => {
  it('detects cat of a non-skill file', () => {
    const actions = parseBashToolActions('cat /data/user-profile.json');
    expect(actions).toHaveLength(1);
    expect(actions[0].type).toBe('file-read');
    if (actions[0].type === 'file-read') {
      expect(actions[0].path).toBe('/data/user-profile.json');
    }
  });

  it('does not classify skill files as file-read', () => {
    const actions = parseBashToolActions('cat /skills/memory-recall/SKILL.md');
    expect(actions).toHaveLength(1);
    expect(actions[0].type).toBe('skill-read');
  });
});

// ============================================================================
// Edge Cases
// ============================================================================

describe('parseBashToolActions — edge cases', () => {
  it('returns empty for unrecognized commands', () => {
    expect(parseBashToolActions('echo hello')).toEqual([]);
  });

  it('returns empty for empty input', () => {
    expect(parseBashToolActions('')).toEqual([]);
  });
});

// ============================================================================
// Display Helpers
// ============================================================================

// ============================================================================
// Reasoning Entry Interleaving
// ============================================================================
// These tests simulate the parseMessageParts interleaving logic:
// reasoning parts become text entries, bash tool-call parts become action entries,
// and text parts trigger a flush (creating a new reasoning block).

/**
 * Simulate the parseMessageParts reasoning/tool-call interleaving logic.
 * Returns an array of reasoning blocks, where each block is ReasoningEntry[].
 */
function simulateReasoningBlocks(
  parts: Array<
    | { type: 'reasoning'; text: string }
    | { type: 'tool-bash'; command: string }
    | { type: 'text'; text: string }
  >,
): ReasoningEntry[][] {
  const blocks: ReasoningEntry[][] = [];
  let pending: ReasoningEntry[] | null = null;

  const flush = () => {
    if (pending && pending.length > 0) {
      blocks.push(pending);
    }
    pending = null;
  };

  for (const part of parts) {
    if (part.type === 'reasoning') {
      if (!pending) pending = [];
      pending.push({ kind: 'text', text: part.text });
    } else if (part.type === 'tool-bash') {
      const actions = parseBashToolActions(part.command);
      if (pending) {
        for (const action of actions) {
          pending.push({ kind: 'action', action });
        }
      }
    } else if (part.type === 'text') {
      flush();
    }
  }

  flush();
  return blocks;
}

describe('reasoning entry interleaving', () => {
  it('produces a single block for consecutive reasoning + tool-calls', () => {
    const blocks = simulateReasoningBlocks([
      { type: 'reasoning', text: 'Let me check the user records.' },
      { type: 'tool-bash', command: 'cat /skills/memory-recall/SKILL.md' },
      { type: 'tool-bash', command: 'recall' },
      { type: 'reasoning', text: 'Now I have context.' },
      { type: 'tool-bash', command: 'fhir Observation/abc' },
      { type: 'reasoning', text: 'I see the lab results.' },
    ]);

    expect(blocks).toHaveLength(1);
    expect(blocks[0]).toHaveLength(6);
    expect(blocks[0][0]).toEqual({
      kind: 'text',
      text: 'Let me check the user records.',
    });
    expect(blocks[0][1]).toEqual({
      kind: 'action',
      action: { type: 'skill-read', skillName: 'memory-recall' },
    });
    expect(blocks[0][2]).toEqual({
      kind: 'action',
      action: { type: 'memory-read' },
    });
    expect(blocks[0][3]).toEqual({
      kind: 'text',
      text: 'Now I have context.',
    });
    expect(blocks[0][4]).toEqual({
      kind: 'action',
      action: { type: 'fhir-query', resourceType: 'Observation' },
    });
    expect(blocks[0][5]).toEqual({
      kind: 'text',
      text: 'I see the lab results.',
    });
  });

  it('produces multiple blocks when text parts appear between reasoning', () => {
    const blocks = simulateReasoningBlocks([
      { type: 'reasoning', text: 'First thinking phase.' },
      { type: 'tool-bash', command: 'recall' },
      { type: 'reasoning', text: 'Done thinking.' },
      { type: 'text', text: 'Here is my initial response.' },
      { type: 'reasoning', text: 'Second thinking phase.' },
      { type: 'tool-bash', command: 'fhir CarePlan/xyz' },
      { type: 'reasoning', text: 'Found more data.' },
    ]);

    expect(blocks).toHaveLength(2);

    // First block
    expect(blocks[0]).toHaveLength(3);
    expect(blocks[0][0]).toEqual({
      kind: 'text',
      text: 'First thinking phase.',
    });
    expect(blocks[0][1]).toEqual({
      kind: 'action',
      action: { type: 'memory-read' },
    });
    expect(blocks[0][2]).toEqual({ kind: 'text', text: 'Done thinking.' });

    // Second block
    expect(blocks[1]).toHaveLength(3);
    expect(blocks[1][0]).toEqual({
      kind: 'text',
      text: 'Second thinking phase.',
    });
    expect(blocks[1][1]).toEqual({
      kind: 'action',
      action: { type: 'fhir-query', resourceType: 'CarePlan' },
    });
    expect(blocks[1][2]).toEqual({ kind: 'text', text: 'Found more data.' });
  });

  it('produces three blocks with two text separators', () => {
    const blocks = simulateReasoningBlocks([
      { type: 'reasoning', text: 'Phase 1.' },
      { type: 'text', text: 'Response 1.' },
      { type: 'reasoning', text: 'Phase 2.' },
      { type: 'text', text: 'Response 2.' },
      { type: 'reasoning', text: 'Phase 3.' },
    ]);

    expect(blocks).toHaveLength(3);
    expect(blocks[0]).toEqual([{ kind: 'text', text: 'Phase 1.' }]);
    expect(blocks[1]).toEqual([{ kind: 'text', text: 'Phase 2.' }]);
    expect(blocks[2]).toEqual([{ kind: 'text', text: 'Phase 3.' }]);
  });

  it('drops tool-calls that occur before any reasoning', () => {
    const blocks = simulateReasoningBlocks([
      { type: 'tool-bash', command: 'recall' },
      { type: 'reasoning', text: 'Now I think.' },
    ]);

    expect(blocks).toHaveLength(1);
    expect(blocks[0]).toHaveLength(1);
    expect(blocks[0][0]).toEqual({ kind: 'text', text: 'Now I think.' });
  });
});

describe('formatActionLabel', () => {
  it('formats FHIR query with resource type', () => {
    expect(
      formatActionLabel({ type: 'fhir-query', resourceType: 'Observation' }),
    ).toBe('Queried FHIR Observation');
  });

  it('formats FHIR query without resource type', () => {
    expect(formatActionLabel({ type: 'fhir-query' })).toBe(
      'Queried health records',
    );
  });

  it('formats memory save', () => {
    expect(formatActionLabel({ type: 'memory-save' })).toBe('Saved memory');
  });

  it('formats memory read', () => {
    expect(formatActionLabel({ type: 'memory-read' })).toBe('Recalled memory');
  });

  it('formats skill read', () => {
    expect(
      formatActionLabel({ type: 'skill-read', skillName: 'memory-recall' }),
    ).toBe('Reading skill');
  });

  it('formats kb search', () => {
    expect(formatActionLabel({ type: 'kb-search', query: 'supplements' })).toBe(
      'Searched knowledge base',
    );
  });

  it('formats file read', () => {
    expect(
      formatActionLabel({ type: 'file-read', path: '/data/profile.json' }),
    ).toBe('Read file');
  });
});
