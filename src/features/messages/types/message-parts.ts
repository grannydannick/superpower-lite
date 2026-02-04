import type { ReactNode } from 'react';

// ============================================================================
// Citation Types
// ============================================================================

export interface CitationInfo {
  number: number;
  source: string;
  title: string;
  citedText: string;
}

// ============================================================================
// Parsed Block Types
// ============================================================================

export interface ParsedBlock {
  kind: 'node' | 'paragraph';
  key: string;
  node?: ReactNode;
  text?: string;
  done?: boolean;
  isStreaming?: boolean;
  citationKeys?: string[];
}

export interface ParsedMessageResult {
  blocks: ParsedBlock[];
  citations: Map<string, CitationInfo>;
}
