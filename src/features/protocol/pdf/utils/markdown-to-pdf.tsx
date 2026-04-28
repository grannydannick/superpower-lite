import { Link, Text, View } from '@react-pdf/renderer';
import type { Style } from '@react-pdf/types';
import type { Nodes, Root, RootContent } from 'mdast';
import React from 'react';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import { unified } from 'unified';

import { sanitizeProtocolMarkdown } from '../../utils/sanitize-markdown';

import { FONT_FAMILY, FONT_FAMILY_MONO } from './pdf-fonts';
import { colors, fontSize } from './pdf-styles';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const COLOR_TEXT = colors.zinc[900];
const COLOR_VERMILLION = colors.vermillion[900];
const BASE_FONT_SIZE = fontSize.base;
const BASE_LINE_HEIGHT = 1.5;

const HEADING_SIZES: Record<number, number> = {
  1: fontSize['2xl'],
  2: fontSize.xl,
  3: fontSize.lg,
  4: fontSize.md,
};

const SAFE_URL_PATTERN = /^https?:|^mailto:/i;

// mdast node types that must NOT be rendered inside a <Text>. Most of these
// emit a <View> (block-level), and react-pdf throws when a View is nested
// inside a Text. If a paragraph somehow contains one of these, we bail out
// of the inline-text rendering path and render the paragraph as a <View>.
const BLOCK_LEVEL_NODE_TYPES = new Set<string>([
  'list',
  'listItem',
  'code',
  'blockquote',
  'table',
  'tableRow',
  'tableCell',
  'thematicBreak',
  'heading',
  'paragraph',
]);

function hasBlockLevelChild(node: { children?: { type: string }[] }): boolean {
  return (node.children ?? []).some((child) =>
    BLOCK_LEVEL_NODE_TYPES.has(child.type),
  );
}

// ---------------------------------------------------------------------------
// Markdown parser (synchronous — unified().parse() is sync)
// ---------------------------------------------------------------------------

const parser = unified().use(remarkParse).use(remarkGfm);

function parseMarkdown(markdown: string): Root {
  return parser.parse(markdown);
}

// ---------------------------------------------------------------------------
// AST → React-PDF element mapper
// ---------------------------------------------------------------------------

/**
 * Recursively converts an mdast node into @react-pdf/renderer elements.
 *
 * IMPORTANT: `Text`, `View`, and `Link` here are from @react-pdf/renderer,
 * **not** React DOM elements.
 */
function renderNode(
  node: Nodes | RootContent,
  listIndex: number | undefined,
  nextKey: () => string,
): React.ReactNode {
  switch (node.type) {
    // -- Root ---------------------------------------------------------------
    case 'root': {
      const children = (node as Root).children.map((child) =>
        renderNode(child, undefined, nextKey),
      );
      return <React.Fragment key={nextKey()}>{children}</React.Fragment>;
    }

    // -- Paragraph ----------------------------------------------------------
    case 'paragraph': {
      // If a paragraph somehow contains a block-level child (rare — usually
      // from malformed markdown or HTML blocks), render as a View so we don't
      // nest a View inside a Text (which react-pdf rejects at render time).
      if (hasBlockLevelChild(node)) {
        return (
          <View key={nextKey()} style={{ marginBottom: 6 }}>
            {node.children.map((child) =>
              renderNode(child, undefined, nextKey),
            )}
          </View>
        );
      }
      const style: Style = {
        fontFamily: FONT_FAMILY,
        fontSize: BASE_FONT_SIZE,
        lineHeight: BASE_LINE_HEIGHT,
        color: COLOR_TEXT,
        marginBottom: 6,
      };
      return (
        <Text key={nextKey()} style={style}>
          {node.children.map((child) => renderNode(child, undefined, nextKey))}
        </Text>
      );
    }

    // -- Heading (depth 1-6) ------------------------------------------------
    case 'heading': {
      const headingFontSize = HEADING_SIZES[node.depth] ?? BASE_FONT_SIZE;
      const style: Style = {
        fontFamily: FONT_FAMILY,
        fontSize: headingFontSize,
        fontWeight: 'bold',
        color: COLOR_TEXT,
        marginBottom: 4,
        marginTop: node.depth <= 2 ? 10 : 6,
        lineHeight: 1.3,
      };
      return (
        <Text key={nextKey()} style={style}>
          {node.children.map((child) => renderNode(child, undefined, nextKey))}
        </Text>
      );
    }

    // -- Text (leaf) --------------------------------------------------------
    case 'text': {
      return node.value;
    }

    // -- Strong / bold ------------------------------------------------------
    case 'strong': {
      return (
        <Text key={nextKey()} style={{ fontWeight: 'bold' }}>
          {node.children.map((child) => renderNode(child, undefined, nextKey))}
        </Text>
      );
    }

    // -- Emphasis / italic --------------------------------------------------
    case 'emphasis': {
      return (
        <Text key={nextKey()} style={{ fontStyle: 'italic' }}>
          {node.children.map((child) => renderNode(child, undefined, nextKey))}
        </Text>
      );
    }

    // -- List ---------------------------------------------------------------
    case 'list': {
      const style: Style = {
        paddingLeft: 12,
        marginBottom: 6,
      };
      const orderedStart = (node.start ?? 1) - 1;
      return (
        <View key={nextKey()} style={style}>
          {node.children.map((child, idx) =>
            renderNode(
              child,
              node.ordered ? orderedStart + idx : undefined,
              nextKey,
            ),
          )}
        </View>
      );
    }

    // -- List item ----------------------------------------------------------
    case 'listItem': {
      const bullet = listIndex != null ? `${listIndex + 1}. ` : '\u2022  ';
      const style: Style = {
        flexDirection: 'row',
        marginBottom: 2,
        alignItems: 'flex-start',
      };
      const bulletStyle: Style = {
        fontFamily: FONT_FAMILY,
        fontSize: BASE_FONT_SIZE,
        lineHeight: BASE_LINE_HEIGHT,
        color: COLOR_TEXT,
        width: listIndex != null ? 16 : 10,
      };
      const contentStyle: Style = {
        flex: 1,
        fontFamily: FONT_FAMILY,
        fontSize: BASE_FONT_SIZE,
        lineHeight: BASE_LINE_HEIGHT,
        color: COLOR_TEXT,
      };
      return (
        <View key={nextKey()} style={style}>
          <Text style={bulletStyle}>{bullet}</Text>
          <View style={contentStyle}>
            {node.children.map((child) =>
              renderNode(child, undefined, nextKey),
            )}
          </View>
        </View>
      );
    }

    // -- Link ---------------------------------------------------------------
    case 'link': {
      if (!SAFE_URL_PATTERN.test(node.url)) {
        return (
          <Text key={nextKey()}>
            {node.children.map((child) =>
              renderNode(child, undefined, nextKey),
            )}
          </Text>
        );
      }
      return (
        <Link
          key={nextKey()}
          src={node.url}
          style={{
            color: COLOR_VERMILLION,
            textDecoration: 'underline',
          }}
        >
          {node.children.map((child) => renderNode(child, undefined, nextKey))}
        </Link>
      );
    }

    // -- Inline code --------------------------------------------------------
    case 'inlineCode': {
      const style: Style = {
        fontFamily: FONT_FAMILY_MONO,
        fontSize: fontSize.sm,
        backgroundColor: colors.zinc[100],
        paddingHorizontal: 2,
      };
      return (
        <Text key={nextKey()} style={style}>
          {node.value}
        </Text>
      );
    }

    // -- Code block ---------------------------------------------------------
    case 'code': {
      const containerStyle: Style = {
        backgroundColor: colors.zinc[100],
        padding: 8,
        marginBottom: 6,
      };
      const textStyle: Style = {
        fontFamily: FONT_FAMILY_MONO,
        fontSize: fontSize.sm,
        lineHeight: 1.4,
        color: COLOR_TEXT,
      };
      return (
        <View key={nextKey()} style={containerStyle}>
          <Text style={textStyle}>{node.value}</Text>
        </View>
      );
    }

    // -- Thematic break (horizontal rule) -----------------------------------
    case 'thematicBreak': {
      const style: Style = {
        borderBottomWidth: 1,
        borderBottomColor: colors.zinc[200],
        marginVertical: 8,
      };
      return <View key={nextKey()} style={style} />;
    }

    // -- Blockquote ---------------------------------------------------------
    case 'blockquote': {
      const style: Style = {
        borderLeftWidth: 2,
        borderLeftColor: colors.zinc[200],
        paddingLeft: 8,
        marginBottom: 6,
        marginLeft: 4,
      };
      return (
        <View key={nextKey()} style={style}>
          {node.children.map((child) => renderNode(child, undefined, nextKey))}
        </View>
      );
    }

    // -- Break (soft/hard line break) ---------------------------------------
    case 'break': {
      return <Text key={nextKey()}>{'\n'}</Text>;
    }

    // -- Delete (strikethrough, GFM) ----------------------------------------
    case 'delete': {
      return (
        <Text key={nextKey()} style={{ textDecoration: 'line-through' }}>
          {node.children.map((child) => renderNode(child, undefined, nextKey))}
        </Text>
      );
    }

    // -- Table (GFM) --------------------------------------------------------
    case 'table': {
      const align = node.align ?? [];
      return (
        <View key={nextKey()} style={{ marginBottom: 6 }}>
          {node.children.map((child) => renderTableRow(child, align, nextKey))}
        </View>
      );
    }

    case 'tableRow':
    case 'tableCell': {
      // Tables route through renderTableRow so column alignment is preserved.
      // A bare row/cell outside a table falls through to the default branch.
      return null;
    }

    // -- Default fallback ---------------------------------------------------
    default: {
      // If the node has children, render them
      if ('children' in node && Array.isArray(node.children)) {
        return (
          <React.Fragment key={nextKey()}>
            {(node.children as RootContent[]).map((child) =>
              renderNode(child, undefined, nextKey),
            )}
          </React.Fragment>
        );
      }
      // If the node has a value (literal), render as Text
      if ('value' in node && typeof node.value === 'string') {
        return (
          <Text key={nextKey()} style={{ fontSize: BASE_FONT_SIZE }}>
            {node.value}
          </Text>
        );
      }
      return null;
    }
  }
}

type TableAlign = NonNullable<Extract<RootContent, { type: 'table' }>['align']>;
type Alignment = TableAlign[number];

function alignToTextAlign(align: Alignment): 'left' | 'center' | 'right' {
  if (align === 'right') return 'right';
  if (align === 'center') return 'center';
  return 'left';
}

function renderTableRow(
  row: RootContent,
  align: TableAlign,
  nextKey: () => string,
): React.ReactNode {
  if (row.type !== 'tableRow') return null;
  return (
    <View
      key={nextKey()}
      style={{
        flexDirection: 'row',
        borderBottomWidth: 0.5,
        borderBottomColor: colors.zinc[200],
      }}
    >
      {row.children.map((cell, idx) =>
        renderTableCell(cell, align[idx] ?? null, nextKey),
      )}
    </View>
  );
}

function renderTableCell(
  cell: RootContent,
  align: Alignment,
  nextKey: () => string,
): React.ReactNode {
  if (cell.type !== 'tableCell') return null;
  return (
    <View
      key={nextKey()}
      style={{
        flex: 1,
        padding: 4,
      }}
    >
      <Text
        style={{
          fontFamily: FONT_FAMILY,
          fontSize: BASE_FONT_SIZE,
          color: COLOR_TEXT,
          textAlign: alignToTextAlign(align),
        }}
      >
        {cell.children.map((child) => renderNode(child, undefined, nextKey))}
      </Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Convert a markdown string into @react-pdf/renderer elements.
 *
 * Applies the same sanitization as the web ProtocolMarkdown component
 * (em-dash replacement and citation marker removal), then parses the
 * markdown and recursively maps the AST to react-pdf primitives.
 *
 * Returns `null` for empty input.
 */
export function renderMarkdownToPdf(markdown: string): React.ReactNode | null {
  if (!markdown || markdown.trim().length === 0) {
    return null;
  }

  let keyCounter = 0;
  const nextKey = () => `md-${keyCounter++}`;

  const sanitized = sanitizeProtocolMarkdown(markdown);
  const tree = parseMarkdown(sanitized);

  return renderNode(tree, undefined, nextKey);
}
