import { UseChatHelpers } from '@ai-sdk/react';
import { useLocalStorage } from '@wojtekmaj/react-hooks';
import { Attachment, Message, UIMessage } from 'ai';
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
import { sanitizeUIMessages } from '@/features/messages/utils/sanitize-ui-messsages';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';
import { cn } from '@/lib/utils';

import { PreviewAttachment } from './preview-attachment';
import { SuggestedActions } from './suggested-actions';

const MAX_HEIGHT = 256;

function PureMultimodalInput({
  chatId,
  input,
  setInput,
  stop,
  attachments,
  status,
  setAttachments,
  messages,
  setMessages,
  handleSubmit,
}: {
  chatId: string;
  input: UseChatHelpers['input'];
  setInput: UseChatHelpers['setInput'];
  status: UseChatHelpers['status'];
  stop: () => void;
  attachments: Array<Attachment>;
  setAttachments: Dispatch<SetStateAction<Array<Attachment>>>;
  messages: Array<UIMessage>;
  setMessages: UseChatHelpers['setMessages'];
  append: UseChatHelpers['append'];
  handleSubmit: UseChatHelpers['handleSubmit'];
  className?: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputWrapperRef = useRef<HTMLDivElement>(null);
  const { width } = useWindowDimensions();
  const createFilesMutation = useCreateFiles();

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
      inputWrapper.style.height = `${scrollHeight + (isAttachmentPresent ? 128 : 32)}px`;

      textarea.style.overflowY =
        textarea.scrollHeight > MAX_HEIGHT ? 'auto' : 'hidden';
    }
  }, [isAttachmentPresent]);

  useEffect(() => {
    if (textareaRef.current) {
      adjustHeight();
    }
  }, [adjustHeight]);

  const resetHeight = useCallback(() => {
    if (textareaRef.current && inputWrapperRef.current) {
      const textarea = textareaRef.current;
      const inputWrapper = inputWrapperRef.current;

      textarea.style.height = 'auto';
      textarea.style.overflowY = 'hidden';
      inputWrapper.style.height = '40px';
    }
  }, []);

  const [localStorageInput, setLocalStorageInput] = useLocalStorage(
    'input',
    '',
  );

  useEffect(() => {
    if (textareaRef.current) {
      const domValue = textareaRef.current.value;
      const finalValue = domValue || localStorageInput || '';
      setInput(finalValue);
      adjustHeight();
    }
  }, [adjustHeight, localStorageInput, setInput]);

  useEffect(() => {
    setLocalStorageInput(input);
  }, [input, setLocalStorageInput]);

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
    adjustHeight();
  };

  const submitForm = useCallback(() => {
    window.history.replaceState({}, '', `/concierge/${chatId}`);

    handleSubmit(undefined, {
      experimental_attachments: attachments,
    });

    setAttachments([]);
    setLocalStorageInput('');
    resetHeight();

    if (width && width > 768) {
      textareaRef.current?.focus();
    }
  }, [
    chatId,
    handleSubmit,
    attachments,
    setAttachments,
    setLocalStorageInput,
    resetHeight,
    width,
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
          ...uploadedAttachments,
        ]);
      } catch (error) {
        console.error('Error uploading files!', error);
      } finally {
        setUploadQueue([]);
      }
    },
    [setAttachments, uploadFiles],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
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
  });

  const handleRemoveAttachment = (url: string) => {
    setAttachments((currentAttachments) =>
      currentAttachments.filter((a) => a.url !== url),
    );
  };

  return (
    <div className="relative flex w-full flex-col gap-4" {...getRootProps()}>
      <input
        type="file"
        className="pointer-events-none fixed -left-4 -top-4 size-0.5 opacity-0"
        ref={fileInputRef}
        multiple
        onChange={handleFileChange}
        tabIndex={-1}
      />

      <div className="flex w-full flex-1 flex-col-reverse gap-2 lg:flex-col lg:gap-4">
        <div
          ref={inputWrapperRef}
          className={cn(
            'relative flex h-full flex-col rounded-[20px] border border-zinc-100 bg-white pb-4 shadow-lg shadow-black/5 transition-all',
            isAttachmentPresent
              ? 'justify-between pt-2'
              : 'justify-center pt-4',
          )}
          style={{
            height: `56px`,
          }}
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
                    name: filename,
                    contentType: '',
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
              className="size-full min-h-0 flex-1 scroll-p-4 overflow-hidden rounded-none border-none bg-transparent p-1 outline-none transition-all scrollbar scrollbar-track-transparent scrollbar-thumb-zinc-300 hover:scrollbar-thumb-zinc-400 focus-visible:bg-transparent focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
              onKeyDown={(event) => {
                if (
                  event.key === 'Enter' &&
                  !event.shiftKey &&
                  !event.nativeEvent.isComposing
                ) {
                  event.preventDefault();

                  if (status !== 'ready') {
                    toast.info(
                      'Please wait for the model to finish its response!',
                    );
                  } else {
                    submitForm();
                  }
                }
              }}
            />
          </div>

          <div className="absolute right-4 flex flex-row items-end justify-end">
            <AttachmentsButton
              {...getInputProps()}
              fileInputRef={fileInputRef}
              status={status}
            />

            {status === 'submitted' ? (
              <StopButton stop={stop} setMessages={setMessages} />
            ) : (
              <SendButton
                input={input}
                submitForm={submitForm}
                uploadQueue={uploadQueue}
              />
            )}
          </div>
        </div>
        {messages.length === 0 &&
          attachments.length === 0 &&
          uploadQueue.length === 0 && <SuggestedActions setInput={setInput} />}
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

    return true;
  },
);

function PureStopButton({
  stop,
  setMessages,
}: {
  stop: () => void;
  setMessages: Dispatch<SetStateAction<Array<Message>>>;
}) {
  return (
    <Button
      className="h-fit rounded-full border p-1.5 dark:border-zinc-600"
      onClick={(event) => {
        event.preventDefault();
        stop();
        setMessages((messages) => sanitizeUIMessages(messages));
      }}
    >
      <StopIcon size={14} />
    </Button>
  );
}

const StopButton = memo(PureStopButton);

function PureSendButton({
  submitForm,
  input,
  uploadQueue,
}: {
  submitForm: () => void;
  input: string;
  uploadQueue: Array<string>;
}) {
  return (
    <Button
      className={cn(
        'h-fit rounded-full border-transparent p-1.5 transition-all disabled:cursor-not-allowed disabled:bg-zinc-500 disabled:opacity-100',
      )}
      onClick={(event) => {
        event.preventDefault();
        submitForm();
      }}
      disabled={input.trim().length === 0 || uploadQueue.length > 0}
    >
      <ArrowUpIcon size={14} />
    </Button>
  );
}

const SendButton = memo(PureSendButton, (prevProps, nextProps) => {
  if (prevProps.uploadQueue.length !== nextProps.uploadQueue.length)
    return false;
  if (prevProps.input !== nextProps.input) return false;
  return true;
});

const StopIcon = ({ size = 16 }: { size?: number }) => {
  return (
    <svg
      height={size}
      viewBox="0 0 16 16"
      width={size}
      style={{ color: 'currentcolor' }}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3 3H13V13H3V3Z"
        fill="currentColor"
      />
    </svg>
  );
};
