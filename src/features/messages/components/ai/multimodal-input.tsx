import { UseChatHelpers } from '@ai-sdk/react';
import { useLocalStorage } from '@wojtekmaj/react-hooks';
import { Attachment, Message, UIMessage } from 'ai';
import equal from 'fast-deep-equal';
import { ArrowUpIcon } from 'lucide-react';
import type React from 'react';
import {
  useRef,
  useEffect,
  useState,
  useCallback,
  type Dispatch,
  type SetStateAction,
  type ChangeEvent,
  memo,
} from 'react';

import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { Textarea } from '@/components/ui/textarea';
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
  append,
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

  const adjustHeight = useCallback(() => {
    if (textareaRef.current && inputWrapperRef.current) {
      const textarea = textareaRef.current;
      const inputWrapper = inputWrapperRef.current;

      textarea.style.height = 'auto';
      const scrollHeight = Math.min(textarea.scrollHeight, MAX_HEIGHT);
      textarea.style.height = `${scrollHeight}px`;
      inputWrapper.style.height = `${scrollHeight + 32}px`;

      textarea.style.overflowY =
        textarea.scrollHeight > MAX_HEIGHT ? 'auto' : 'hidden';
    }
  }, []);

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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadQueue, setUploadQueue] = useState<Array<string>>([]);

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
    attachments,
    handleSubmit,
    setAttachments,
    setLocalStorageInput,
    width,
    chatId,
  ]);

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      // TODO: change me
      const response = await fetch(
        'http://127.0.0.1:3005/api/v1/files/upload',
        {
          method: 'POST',
          body: formData,
        },
      );

      if (response.ok) {
        const data = await response.json();
        const { url, pathname, contentType } = data;

        return {
          url,
          name: pathname,
          contentType: contentType,
        };
      }
      const { error } = await response.json();
      toast.error(error);
    } catch (error) {
      toast.error('Failed to upload file, please try again!');
    }
  };

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);

      setUploadQueue(files.map((file) => file.name));

      try {
        const uploadPromises = files.map((file) => uploadFile(file));
        const uploadedAttachments = await Promise.all(uploadPromises);
        const successfullyUploadedAttachments = uploadedAttachments.filter(
          (attachment) => attachment !== undefined,
        ) as Attachment[];

        setAttachments((currentAttachments) => [
          ...currentAttachments,
          ...successfullyUploadedAttachments,
        ]);
      } catch (error) {
        console.error('Error uploading files!', error);
      } finally {
        setUploadQueue([]);
      }
    },
    [setAttachments],
  );

  return (
    <div className="relative flex w-full flex-col gap-4">
      <input
        type="file"
        className="pointer-events-none fixed -left-4 -top-4 size-0.5 opacity-0"
        ref={fileInputRef}
        multiple
        onChange={handleFileChange}
        tabIndex={-1}
      />

      {(attachments.length > 0 || uploadQueue.length > 0) && (
        <div className="flex flex-row items-end gap-2 overflow-x-scroll">
          {attachments.map((attachment) => (
            <PreviewAttachment key={attachment.url} attachment={attachment} />
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
            />
          ))}
        </div>
      )}

      <div className="flex w-full flex-1 flex-col-reverse gap-2 lg:flex-col lg:gap-4">
        <div
          ref={inputWrapperRef}
          className="relative flex min-h-14 items-center gap-4 rounded-[20px] border border-zinc-100 bg-white p-4 shadow-lg shadow-black/5 transition-all"
        >
          <Textarea
            ref={textareaRef}
            placeholder="Ask anything..."
            value={input}
            onChange={handleInput}
            style={{
              // Setting padding right doesn't work via tailwind for textarea, needs to be adjusted when adding attachments
              paddingRight: 48,
            }}
            rows={1}
            className="scrollbar-w-1.5 size-full min-h-0 flex-1 scroll-p-4 overflow-hidden border-none bg-transparent p-0 outline-none transition-all scrollbar scrollbar-track-transparent scrollbar-thumb-zinc-300 hover:scrollbar-thumb-zinc-400 focus-visible:bg-transparent focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
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

          <div className="absolute bottom-3.5 right-4 flex h-full flex-row items-end justify-end">
            {/*<AttachmentsButton fileInputRef={fileInputRef} status={status} />*/}

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
          uploadQueue.length === 0 && (
            <SuggestedActions append={append} chatId={chatId} />
          )}
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

// function PureAttachmentsButton({
//   fileInputRef,
//   status,
// }: {
//   fileInputRef: React.MutableRefObject<HTMLInputElement | null>;
//   status: UseChatHelpers['status'];
// }) {
//   return (
//     <Button
//       className="h-fit rounded-md rounded-bl-lg p-[7px] hover:bg-zinc-200 dark:border-zinc-700 hover:dark:bg-zinc-900"
//       onClick={(event) => {
//         event.preventDefault();
//         fileInputRef.current?.click();
//       }}
//       disabled={status !== 'ready'}
//       variant="ghost"
//     >
//       <PaperclipIcon size={14} />
//     </Button>
//   );
// }

// const AttachmentsButton = memo(PureAttachmentsButton);

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
        'h-fit rounded-full border p-1.5 transition-all disabled:cursor-not-allowed disabled:bg-zinc-500 disabled:opacity-100 dark:border-zinc-600',
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
