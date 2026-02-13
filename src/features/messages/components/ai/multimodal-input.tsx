import { UseChatHelpers } from '@ai-sdk/react';
import { FileUIPart, UIMessage } from 'ai';
import equal from 'fast-deep-equal';
import { ArrowUpIcon } from 'lucide-react';
import type React from 'react';
import {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type Dispatch,
  type SetStateAction,
} from 'react';
import { useDropzone } from 'react-dropzone';

import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { Textarea } from '@/components/ui/textarea';
import { acceptedFileContentTypes } from '@/const';
import { useCreateFiles } from '@/features/files/api';
import { AttachmentsButton } from '@/features/messages/components/ai/attachements-button';
import { useAnalytics } from '@/hooks/use-analytics';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';
import { cn } from '@/lib/utils';

import { scrollToBottom } from '../../utils/scroll-to-bottom';

import { PreviewAttachment } from './preview-attachment';

const MAX_HEIGHT = 256;

function PureMultimodalInput({
  input,
  setInput,
  attachments,
  status,
  setAttachments,
  sendMessage,
  className,
  /** TODO: Temporarily disable file upload button for AI concierge */
  disableFileUpload = false,
}: {
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
  status: UseChatHelpers<UIMessage>['status'];
  attachments: Array<FileUIPart>;
  setAttachments: Dispatch<SetStateAction<Array<FileUIPart>>>;
  sendMessage: UseChatHelpers<UIMessage>['sendMessage'];
  className?: string;
  showSuggestions?: boolean;
  disableFileUpload?: boolean;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputWrapperRef = useRef<HTMLDivElement>(null);
  const { width } = useWindowDimensions();
  const { track } = useAnalytics();
  const createFilesMutation = useCreateFiles({ context: 'ai-chat' });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadQueue, setUploadQueue] = useState<Array<string>>([]);

  const isAttachmentPresent = attachments.length > 0 || uploadQueue.length > 0;

  const adjustHeight = useCallback(() => {
    if (textareaRef.current && inputWrapperRef.current) {
      const textarea = textareaRef.current;
      const inputWrapper = inputWrapperRef.current;

      textarea.style.height = 'auto';
      const scrollHeight = Math.min(textarea.scrollHeight, MAX_HEIGHT);
      textarea.style.height = `${scrollHeight}px`;
      const extra = isAttachmentPresent ? 128 : 24;
      inputWrapper.style.height = `${scrollHeight + extra}px`;

      textarea.style.overflowY =
        textarea.scrollHeight > MAX_HEIGHT ? 'auto' : 'hidden';
    }
  }, [isAttachmentPresent]);

  const resetHeight = useCallback(() => {
    if (textareaRef.current && inputWrapperRef.current) {
      const textarea = textareaRef.current;
      const inputWrapper = inputWrapperRef.current;

      textarea.style.height = 'auto';
      textarea.style.overflowY = 'hidden';
      // Keep reset height consistent with the desired base height
      inputWrapper.style.height = '56px';
    }
  }, []);

  // Adjust height on mount and whenever input changes
  useEffect(() => {
    requestAnimationFrame(() => adjustHeight());
  }, [adjustHeight, input]);

  // Recalculate height when the wrapper resizes (e.g., when overlay becomes visible)
  // This is important for the chat assistant
  useEffect(() => {
    const el = inputWrapperRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      adjustHeight();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [adjustHeight]);

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
    adjustHeight();
  };

  const submitForm = useCallback(() => {
    // Track the AI message event
    track('sent_message_ai', {
      message_length: input.length,
    });

    sendMessage({
      text: input,
      files: attachments,
    });

    setAttachments([]);
    resetHeight();

    scrollToBottom();

    if (width && width > 768) {
      textareaRef.current?.focus();
    }
  }, [
    sendMessage,
    input,
    attachments,
    setAttachments,
    resetHeight,
    width,
    track,
  ]);

  const uploadFiles = useCallback(
    async (files: File[]) => {
      try {
        const { successful } = await createFilesMutation.mutateAsync({
          data: {
            files: files.map((file) => ({
              rawFile: file,
              source: 'user',
            })),
          },
        });

        return successful.map((superpowerFile) => ({
          url: `/files/${superpowerFile.id}`,
          name: superpowerFile.name,
          contentType: superpowerFile.contentType,
        }));
      } catch (error) {
        toast.error('Failed to upload files, please try again!');
        console.error('Error uploading files!', error);
        return [];
      }
    },
    [createFilesMutation],
  );

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      let files = Array.from(event.target.files || []);

      files = files.filter((f) => {
        const isDev = process.env.NODE_ENV === 'development';
        if (f.type.startsWith('image')) {
          // we need this check because images are not supported locally
          if (isDev) {
            toast.error('Images are only supported in production');
            return;
          }
        }

        // only support pdfs for now (.CSV is not supported by o4)
        const isSupported = f.type === 'application/pdf';
        if (!isSupported) {
          toast.error('Only PDF files are currently supported.');
        }

        return isSupported;
      });

      setUploadQueue(files.map((file) => file.name));

      try {
        const uploadedAttachments = await uploadFiles(files);

        setAttachments((currentAttachments) => [
          ...currentAttachments,
          ...uploadedAttachments.map(
            (attachment) =>
              ({
                url: attachment.url,
                filename: attachment.name,
                type: 'file' as const,
                mediaType: attachment.contentType,
              }) satisfies FileUIPart,
          ),
        ]);
      } catch (error) {
        console.error('Error uploading files!', error);
      } finally {
        setUploadQueue([]);
      }
    },
    [setAttachments, uploadFiles],
  );

  const { getRootProps, isDragActive } = useDropzone({
    // We only want to handle files that can actually be stored for now
    accept: acceptedFileContentTypes,
    onDrop: (acceptedFiles) => {
      const fileList = {
        item: (index: number) => acceptedFiles[index],
        length: acceptedFiles.length,
        [Symbol.iterator]: function* () {
          let i = 0;
          while (i < acceptedFiles.length) {
            yield acceptedFiles[i];
            i++;
          }
        },
      } as FileList;

      handleFileChange({
        target: {
          files: fileList,
        } as ChangeEvent<HTMLInputElement>['target'],
      } as ChangeEvent<HTMLInputElement>);
    },
    noClick: true,
    noDragEventsBubbling: true,
    disabled: disableFileUpload,
  });

  const handleRemoveAttachment = (url: string) => {
    setAttachments((currentAttachments) =>
      currentAttachments.filter((a) => a.url !== url),
    );
  };

  return (
    <div
      className="relative flex w-full flex-col gap-8 outline-none"
      {...getRootProps()}
    >
      <input
        type="file"
        className="pointer-events-none fixed -left-4 -top-4 size-0.5 opacity-0"
        ref={fileInputRef}
        multiple
        onChange={handleFileChange}
        tabIndex={-1}
      />

      <div className="flex w-full flex-1 flex-col gap-2 lg:flex-col lg:gap-4">
        <div
          ref={inputWrapperRef}
          className={cn(
            'relative flex flex-col rounded-2xl border border-input bg-white pb-4 shadow-lg shadow-black/5 transition-all min-h-[56px] shrink-0',
            isAttachmentPresent
              ? 'justify-between pt-2'
              : 'justify-center pt-4',
            className,
          )}
        >
          {isDragActive && (
            <svg
              className="absolute inset-0 size-full text-vermillion-900 animate-in fade-in"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="6"
              preserveAspectRatio="xMidYMid meet"
            >
              <rect
                width="calc(100% - 2px)"
                height="calc(100% - 2px)"
                x="1"
                y="1"
                rx="16"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              >
                <animate
                  attributeName="stroke-dashoffset"
                  values="12;0"
                  dur="0.5s"
                  repeatCount="indefinite"
                />
              </rect>
            </svg>
          )}
          {isAttachmentPresent && (
            <div className="flex shrink-0 flex-row items-center justify-start gap-2 overflow-x-scroll px-4 pt-2 duration-500 animate-in fade-in scrollbar scrollbar-track-transparent scrollbar-thumb-zinc-300 [mask-image:linear-gradient(to_right,transparent,black_2%,black_98%,transparent)] hover:scrollbar-thumb-zinc-400 [&>div]:!ml-0">
              {attachments.map((attachment) => (
                <PreviewAttachment
                  key={attachment.url}
                  attachment={attachment}
                  onRemove={() => handleRemoveAttachment(attachment.url)}
                />
              ))}

              {uploadQueue.map((filename) => (
                <PreviewAttachment
                  key={filename}
                  attachment={{
                    url: '',
                    filename: filename,
                    mediaType: '',
                    type: 'file',
                  }}
                  isUploading={true}
                  onRemove={() => handleRemoveAttachment(filename)}
                />
              ))}
            </div>
          )}
          <div
            className={cn(
              'relative flex min-h-10 items-end gap-4 pl-4',
              isAttachmentPresent ? 'items-end' : 'items-center',
            )}
          >
            <Textarea
              ref={textareaRef}
              placeholder="Ask anything..."
              value={input}
              onChange={handleInput}
              style={{
                // Setting padding right doesn't work via tailwind for textarea, needs to be adjusted when adding attachments
                paddingRight: 96,
              }}
              rows={1}
              disabled={status !== 'ready' && status !== 'error'}
              className="size-full min-h-0 flex-1 scroll-p-4 overflow-hidden rounded-none border-none bg-transparent p-1 outline-none transition-all scrollbar scrollbar-track-transparent scrollbar-thumb-zinc-300 hover:scrollbar-thumb-zinc-400 focus-visible:bg-transparent focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
              onKeyDown={(event) => {
                if (
                  event.key === 'Enter' &&
                  !event.shiftKey &&
                  !event.nativeEvent.isComposing
                ) {
                  event.preventDefault();

                  // same as send button disabled logic: block when input is empty/whitespace
                  if (input.trim().length === 0 || uploadQueue.length > 0) {
                    return;
                  }

                  submitForm();
                }
              }}
            />
          </div>

          <div className="absolute bottom-[13px] right-4 flex flex-row items-end justify-end">
            {!disableFileUpload && (
              <AttachmentsButton fileInputRef={fileInputRef} status={status} />
            )}

            <SendButton
              input={input}
              submitForm={submitForm}
              uploadQueue={uploadQueue}
              status={status}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export const MultimodalInput = memo(
  PureMultimodalInput,
  (prevProps, nextProps) => {
    if (prevProps.input !== nextProps.input) return false;
    if (prevProps.status !== nextProps.status) return false;
    if (!equal(prevProps.attachments, nextProps.attachments)) return false;
    if (prevProps.disableFileUpload !== nextProps.disableFileUpload)
      return false;

    return true;
  },
);

function PureSendButton({
  submitForm,
  input,
  uploadQueue,
  status,
}: {
  submitForm: () => void;
  input: string;
  uploadQueue: Array<string>;
  status: UseChatHelpers<UIMessage>['status'];
}) {
  const canSend = status === 'ready' || status === 'error';

  return (
    <Button
      className={cn(
        'h-fit rounded-full border-transparent p-1.5 transition-all disabled:cursor-not-allowed disabled:bg-zinc-500 disabled:opacity-100',
      )}
      onClick={(event) => {
        event.preventDefault();
        submitForm();
      }}
      disabled={!canSend || input.trim().length === 0 || uploadQueue.length > 0}
    >
      <ArrowUpIcon size={14} />
    </Button>
  );
}

const SendButton = memo(PureSendButton, (prevProps, nextProps) => {
  if (prevProps.uploadQueue.length !== nextProps.uploadQueue.length)
    return false;
  if (prevProps.input !== nextProps.input) return false;
  if (prevProps.status !== nextProps.status) return false;
  return true;
});
