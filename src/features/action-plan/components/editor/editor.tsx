import { Editor } from '@tiptap/core';
import { useCurrentEditor } from '@tiptap/react';
import { useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

import {
  ColorSelector,
  EditorBubble,
  EditorCommand,
  EditorCommandEmpty,
  EditorCommandItem,
  EditorCommandList,
  EditorContent,
  EditorRoot,
  LinkSelector,
  MathSelector,
  NodeSelector,
  TextButtons,
} from '@/components/ui/editor';
import { handleCommandNavigation } from '@/components/ui/editor/extensions';
import { Separator } from '@/components/ui/separator';
import { ACTION_PLAN_EDITOR_SAVE_DELAY } from '@/features/action-plan/const/delay';
import { usePlan } from '@/features/action-plan/stores/plan-store';
import { cn } from '@/lib/utils';

import { parseInitialContent } from '../../utils/parse-initial-content';

import { defaultExtensions } from './extensions';
import { slashCommand, suggestionItems } from './slash-command';

const extensions = [...defaultExtensions, slashCommand];

interface BlockEditorProps {
  initialContent: string;
  onUpdate: (content: string) => void;
  className?: string;
}

export const BlockEditor = ({
  initialContent,
  onUpdate,
  className,
}: BlockEditorProps) => {
  const content = parseInitialContent(initialContent);
  const { editor } = useCurrentEditor();
  const isAdmin = usePlan((s) => s.isAdmin);
  const updateActionPlan = usePlan((s) => s.updateActionPlan);

  const [openNode, setOpenNode] = useState(false);
  const [openColor, setOpenColor] = useState(false);
  const [openLink, setOpenLink] = useState(false);

  const debouncedUpdates = useDebouncedCallback(async (editor: Editor) => {
    const json = editor.getJSON();
    onUpdate(JSON.stringify(json));
    await updateActionPlan();
  }, ACTION_PLAN_EDITOR_SAVE_DELAY);

  // If no content, do not render to resolve spacing issues.
  if (
    !isAdmin &&
    content?.content.length === 1 &&
    (content?.content[0]?.content?.length === undefined ||
      content?.content[0]?.content?.length === 0)
  ) {
    return <div className="h-4"></div>;
  }

  return (
    <EditorRoot>
      <EditorContent
        initialContent={content}
        extensions={extensions}
        editable={isAdmin}
        editorProps={{
          handleDOMEvents: {
            keydown: (_view, event) => handleCommandNavigation(event),
          },
          attributes: {
            class: cn(
              'prose prose-lg prose-headings:font-title font-default focus:outline-none max-w-full py-8',
              className,
            ),
          },
        }}
        onUpdate={({ editor }) => {
          debouncedUpdates(editor);
        }}
      >
        <EditorCommand className="z-50 h-auto max-h-[330px] overflow-y-auto rounded-md border border-muted bg-background px-1 py-2 shadow-md transition-all">
          <EditorCommandEmpty className="px-2 text-muted-foreground">
            No results
          </EditorCommandEmpty>
          <EditorCommandList>
            {suggestionItems.map((item) => (
              <EditorCommandItem
                value={item.title}
                onCommand={(val) => item.command && item.command(val)}
                className="flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm aria-selected:bg-accent hover:bg-accent"
                key={item.title}
              >
                <div className="flex size-10 items-center justify-center rounded-md border border-muted bg-background">
                  {item.icon}
                </div>
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </EditorCommandItem>
            ))}
          </EditorCommandList>
        </EditorCommand>
        <EditorBubble
          tippyOptions={{
            placement: 'top',
            onHidden: () => {
              editor?.chain().unsetHighlight().run();
            },
          }}
          className="flex w-fit max-w-[90vw] items-center justify-center overflow-hidden rounded-md border border-muted bg-background p-2 shadow-lg"
        >
          <NodeSelector open={openNode} onOpenChange={setOpenNode} />
          <Separator orientation="vertical" className="h-4 w-px" />

          <LinkSelector open={openLink} onOpenChange={setOpenLink} />
          <Separator orientation="vertical" className="h-4 w-px" />
          <MathSelector />
          <Separator orientation="vertical" className="h-4 w-px" />
          <TextButtons />
          <Separator orientation="vertical" className="h-4 w-px" />
          <ColorSelector open={openColor} onOpenChange={setOpenColor} />
        </EditorBubble>
      </EditorContent>
    </EditorRoot>
  );
};
