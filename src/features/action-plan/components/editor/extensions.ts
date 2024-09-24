import { InputRule } from '@tiptap/core';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import { HorizontalRule } from '@tiptap/extension-horizontal-rule';
import TiptapLink from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { TextStyle } from '@tiptap/extension-text-style';
import TiptapUnderline from '@tiptap/extension-underline';
import Youtube from '@tiptap/extension-youtube';
import { StarterKit } from '@tiptap/starter-kit';
import AutoJoiner from 'tiptap-extension-auto-joiner';
import GlobalDragHandle from 'tiptap-extension-global-drag-handle';
import { Markdown } from 'tiptap-markdown';

import { Mathematics, Twitter } from '@/components/ui/editor';

const starterKit = StarterKit.configure({
  heading: {
    levels: [1, 2, 3],
  },
  blockquote: {
    HTMLAttributes: {
      class: 'border-l-4 border-zinc-200',
    },
  },
  bulletList: {
    HTMLAttributes: {
      class: 'list-disc list-outside leading-3 -mt-2',
    },
    keepMarks: true,
    keepAttributes: false, // TODO : Making this as `false` because marks are not preserved when I try to preserve attrs, awaiting a bit of help
  },
  orderedList: {
    HTMLAttributes: {
      class: 'list-decimal list-outside -mt-2',
    },
    keepMarks: true,
    keepAttributes: false, // TODO : Making this as `false` because marks are not preserved when I try to preserve attrs, awaiting a bit of help
  },
});

const placeholder = Placeholder.configure({
  placeholder: ({ node }) => {
    if (node.type.name === 'heading') {
      return `Heading ${node.attrs.level}`;
    }

    return "Press '/' for commands";
  },
});

const tiptapLink = TiptapLink.configure({
  HTMLAttributes: {
    class:
      'text-muted-foreground underline underline-offset-[3px] hover:text-primary transition-colors cursor-pointer',
  },
});

const horizontalRule = HorizontalRule.extend({
  addInputRules() {
    return [
      new InputRule({
        find: /^(?:---|—-|___\s|\*\*\*\s)$/u,
        handler: ({ state, range }) => {
          const attributes = {};

          const { tr } = state;
          const start = range.from;
          const end = range.to;

          tr.insert(start - 1, this.type.create(attributes)).delete(
            tr.mapping.map(start),
            tr.mapping.map(end),
          );
        },
      }),
    ];
  },
}).configure({
  HTMLAttributes: {
    class: 'mt-4 mb-6 border-t border-zinc-300',
  },
});

const youtube = Youtube.configure({
  HTMLAttributes: {
    class:
      'rounded-lg border outline-none border-zinc-200 w-full max-h-[200px] md:max-h-[350px] lg:max-h-none',
  },
  inline: false,
});

const twitter = Twitter.configure({
  HTMLAttributes: {
    class: 'not-prose',
  },
  inline: false,
});

const mathematics = Mathematics.configure({
  HTMLAttributes: {
    class: 'text-foreground rounded p-1 hover:bg-accent cursor-pointer',
  },
  katexOptions: {
    throwOnError: false,
  },
});

const highlight = Highlight.configure({
  multicolor: true,
});

const markdown = Markdown.configure({
  html: false,
  transformCopiedText: true,
});

const dragHandle = GlobalDragHandle.configure({
  scrollTreshold: 0,
});

export const defaultExtensions = [
  starterKit,
  placeholder,
  tiptapLink,
  horizontalRule,
  youtube,
  twitter,
  mathematics,
  TiptapUnderline,
  markdown,
  highlight,
  TextStyle,
  Color,
  dragHandle,
  AutoJoiner,
];
