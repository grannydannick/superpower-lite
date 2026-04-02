import { UseChatHelpers } from '@ai-sdk/react';
import { FileUIPart, UIMessage } from 'ai';
import { ArrowUpIcon } from 'lucide-react';
import React, {
  useEffect,
  useEffectEvent,
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
import {
  acceptedFileContentTypes,
  MAX_FILE_COUNT,
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_MB,
} from '@/const';
import { useUploadFiles } from '@/features/files/api';
import { AttachmentsButton } from '@/features/messages/components/ai/attachements-button';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';
import { cn } from '@/lib/utils';

import { scrollToBottom } from '../../utils/scroll-to-bottom';

import { LabUploadDropzone } from './lab-upload-dropzone';
import { PreviewAttachment } from './preview-attachment';

const MAX_HEIGHT = 256;

export function MultimodalInput({
  input,
  setInput,
  attachments,
  status,
  setAttachments,
  sendMessage,
  className,
  /** TODO: Temporarily disable file upload button for AI concierge */
  disableFileUpload = false,
  allowSendWithAttachmentsOnly = false,
  showLabUploadDropzone = false,
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
  allowSendWithAttachmentsOnly?: boolean;
  showLabUploadDropzone?: boolean;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputWrapperRef = useRef<HTMLDivElement>(null);
  const { width } = useWindowDimensions();
  const { mutateAsync: uploadFilesAsync } = useUploadFiles({
    context: 'ai-chat',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadQueue, setUploadQueue] = useState<Array<string>>([]);

  const isAttachmentPresent = attachments.length > 0 || uploadQueue.length > 0;
  const isTouchDevice =
    typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0;

  const adjustHeight = useEffectEvent(() => {
    if (textareaRef.current == null || inputWrapperRef.current == null) return;
    const textarea = textareaRef.current;
    const inputWrapper = inputWrapperRef.current;

    textarea.style.height = 'auto';
    const scrollHeight = Math.min(textarea.scrollHeight, MAX_HEIGHT);
    textarea.style.height = `${scrollHeight}px`;
    const extra = isAttachmentPresent ? 128 : 24;
    inputWrapper.style.height = `${scrollHeight + extra}px`;

    textarea.style.overflowY =
      textarea.scrollHeight > MAX_HEIGHT ? 'auto' : 'hidden';
  });

  const resetHeight = () => {
    if (textareaRef.current == null || inputWrapperRef.current == null) return;
    const textarea = textareaRef.current;
    const inputWrapper = inputWrapperRef.current;

    textarea.style.height = 'auto';
    textarea.style.overflowY = 'hidden';
    inputWrapper.style.height = '56px';
  };

  useEffect(() => {
    requestAnimationFrame(() => adjustHeight());
  }, [isAttachmentPresent, input]);

  useEffect(() => {
    const el = inputWrapperRef.current;
    if (el == null) return;
    const ro = new ResizeObserver(() => {
      adjustHeight();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
    adjustHeight();
  };

  const hasContent =
    input.trim().length > 0 ||
    (allowSendWithAttachmentsOnly && attachments.length > 0);

  const submitForm = () => {
    const trimmedText = input.trim();
    void sendMessage({
      ...(trimmedText ? { text: trimmedText } : {}),
      files: attachments,
    });

    setAttachments([]);
    resetHeight();

    scrollToBottom();

    if (width > 768) {
      textareaRef.current?.focus();
    }
  };

  const uploadFiles = async (files: File[]) => {
    try {
      const { uploaded } = await uploadFilesAsync({
        data: { files },
      });

      return uploaded.map((file) => ({
        url: `/files/${file.id}`,
        name: file.name,
        contentType: file.contentType,
      }));
    } catch (error) {
      toast.error('Failed to upload files, please try again!');
      console.error('Error uploading files!', error);
      return [];
    }
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    let files = Array.from(event.target.files || []);

    files = files.filter((f) => {
      const isDev = import.meta.env.DEV;
      if (f.type.startsWith('image')) {
        if (isDev) {
          toast.error('Images are only supported in production');
          return;
        }
      }

      const isSupported = f.type === 'application/pdf';
      if (!isSupported) {
        toast.error('Only PDF files are currently supported.');
      }

      return isSupported;
    });

    const currentCount = attachments.length;
    if (currentCount + files.length > MAX_FILE_COUNT) {
      const allowed = MAX_FILE_COUNT - currentCount;
      if (allowed <= 0) {
        toast.error(
          `You can upload a maximum of ${MAX_FILE_COUNT} files at once.`,
        );
        return;
      }
      toast.error(
        `You can upload a maximum of ${MAX_FILE_COUNT} files at once. Only the first ${allowed} will be uploaded.`,
      );
      files = files.slice(0, allowed);
    }

    setUploadQueue(files.map((file) => file.name));

    try {
      const uploadedAttachments = await uploadFiles(files);

      setAttachments((currentAttachments) => {
        const existingUrls = new Set(currentAttachments.map((a) => a.url));
        const newAttachments = uploadedAttachments
          .filter((a) => !existingUrls.has(a.url))
          .map(
            (attachment) =>
              ({
                url: attachment.url,
                filename: attachment.name,
                type: 'file' as const,
                mediaType: attachment.contentType,
              }) satisfies FileUIPart,
          );
        return [...currentAttachments, ...newAttachments];
      });
    } catch (error) {
      console.error('Error uploading files!', error);
    }

    setUploadQueue([]);
  };

  const { getRootProps, isDragActive } = useDropzone({
    accept: acceptedFileContentTypes,
    maxFiles: MAX_FILE_COUNT,
    maxSize: MAX_FILE_SIZE_BYTES,
    onDrop: (acceptedFiles) => {
      const fileList = {
        item: (index: number) => acceptedFiles[index] ?? null,
        length: acceptedFiles.length,
        [Symbol.iterator]: () => acceptedFiles.values(),
      } as FileList;

      handleFileChange({
        target: {
          files: fileList,
        } as ChangeEvent<HTMLInputElement>['target'],
      } as ChangeEvent<HTMLInputElement>);
    },
    onDropRejected: (rejectedFiles) => {
      const hasTooManyFilesError = rejectedFiles.some(({ errors }) =>
        errors.some((error) => error.code === 'too-many-files'),
      );
      if (hasTooManyFilesError) {
        toast.error(
          `You can upload a maximum of ${MAX_FILE_COUNT} files at once.`,
        );
        return;
      }

      rejectedFiles.forEach(({ file, errors }) => {
        const sizeError = errors.find((e) => e.code === 'file-too-large');
        if (sizeError) {
          const sizeMB = Math.round(file.size / (1024 * 1024));
          toast.error(
            `"${file.name}" is too large (${sizeMB}MB). Maximum is ${MAX_FILE_SIZE_MB}MB.`,
          );
          return;
        }
        toast.error(`File type not supported: ${file.type}`);
      });
    },
    noClick: true,
    noDragEventsBubbling: true,
    disabled: disableFileUpload,
  });

  const handleRemoveAttachment = (url: string) => {
    setAttachments((currentAttachments) => {
      const nextAttachments: FileUIPart[] = [];
      for (const attachment of currentAttachments) {
        if (attachment.url === url) continue;
        nextAttachments.push(attachment);
      }
      return nextAttachments;
    });
  };

  return (
    <MultimodalInputView
      getRootProps={getRootProps}
      isDragActive={isDragActive}
      fileInputRef={fileInputRef}
      handleFileChange={handleFileChange}
      inputWrapperRef={inputWrapperRef}
      isAttachmentPresent={isAttachmentPresent}
      attachments={attachments}
      uploadQueue={uploadQueue}
      handleRemoveAttachment={handleRemoveAttachment}
      textareaRef={textareaRef}
      input={input}
      handleInput={handleInput}
      status={status}
      className={className}
      disableFileUpload={disableFileUpload}
      hasContent={hasContent}
      submitForm={submitForm}
      showLabUploadDropzone={showLabUploadDropzone}
      isTouchDevice={isTouchDevice}
    />
  );
}

interface MultimodalInputViewProps {
  getRootProps: ReturnType<typeof useDropzone>['getRootProps'];
  isDragActive: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileChange: (
    event: ChangeEvent<HTMLInputElement>,
  ) => void | Promise<void>;
  inputWrapperRef: React.RefObject<HTMLDivElement | null>;
  isAttachmentPresent: boolean;
  attachments: Array<FileUIPart>;
  uploadQueue: Array<string>;
  handleRemoveAttachment: (url: string) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  input: string;
  handleInput: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  status: UseChatHelpers<UIMessage>['status'];
  className: string | undefined;
  disableFileUpload: boolean;
  hasContent: boolean;
  submitForm: () => void;
  showLabUploadDropzone: boolean;
  isTouchDevice: boolean;
}

function MultimodalInputView({
  getRootProps,
  isDragActive,
  fileInputRef,
  handleFileChange,
  inputWrapperRef,
  isAttachmentPresent,
  attachments,
  uploadQueue,
  handleRemoveAttachment,
  textareaRef,
  input,
  handleInput,
  status,
  className,
  disableFileUpload,
  hasContent,
  submitForm,
  showLabUploadDropzone,
  isTouchDevice,
}: MultimodalInputViewProps) {
  const previews: React.ReactElement[] = [];
  for (const attachment of attachments) {
    previews.push(
      <PreviewAttachment
        key={attachment.url}
        attachment={attachment}
        onRemove={() => handleRemoveAttachment(attachment.url)}
      />,
    );
  }

  const uploading: React.ReactElement[] = [];
  for (const filename of uploadQueue) {
    uploading.push(
      <PreviewAttachment
        key={filename}
        attachment={{
          url: '',
          filename,
          mediaType: '',
          type: 'file',
        }}
        isUploading={true}
        onRemove={() => handleRemoveAttachment(filename)}
      />,
    );
  }

  return (
    <div
      className={cn(
        'relative flex w-full flex-col outline-none',
        showLabUploadDropzone ? 'gap-3' : 'gap-8',
      )}
      {...getRootProps()}
    >
      <input
        type="file"
        accept=".pdf,application/pdf"
        className="pointer-events-none fixed -left-4 -top-4 size-0.5 opacity-0"
        ref={fileInputRef}
        multiple
        onChange={handleFileChange}
        tabIndex={-1}
      />

      {showLabUploadDropzone && (
        <LabUploadDropzone
          isDragActive={isDragActive}
          onClick={() => fileInputRef.current?.click()}
        />
      )}

      <div className="flex w-full flex-1 flex-col gap-2 lg:flex-col lg:gap-4">
        <div
          ref={inputWrapperRef}
          className={cn(
            'relative flex min-h-[56px] shrink-0 flex-col rounded-2xl border border-input bg-white pb-4 shadow-lg shadow-black/5 transition-all',
            isAttachmentPresent
              ? 'justify-between pt-2'
              : 'justify-center pt-4',
            className,
          )}
        >
          {isDragActive && !showLabUploadDropzone && (
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
              {previews}
              {uploading}
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
              disabled={false}
              className="size-full min-h-0 flex-1 scroll-p-4 overflow-hidden rounded-none border-none bg-transparent p-1 outline-none transition-all scrollbar scrollbar-track-transparent scrollbar-thumb-zinc-300 hover:scrollbar-thumb-zinc-400 focus-visible:bg-transparent focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
              onKeyDown={(event) => {
                if (
                  event.key === 'Enter' &&
                  !event.shiftKey &&
                  !event.nativeEvent.isComposing &&
                  !isTouchDevice
                ) {
                  event.preventDefault();

                  if (!hasContent || uploadQueue.length > 0) {
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

            <Button
              type="button"
              className={cn(
                'h-fit rounded-full border-transparent p-1.5 transition-all disabled:cursor-not-allowed disabled:bg-zinc-500 disabled:opacity-100',
              )}
              onClick={(event) => {
                event.preventDefault();
                submitForm();
              }}
              disabled={!hasContent || uploadQueue.length > 0}
            >
              <ArrowUpIcon size={14} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
