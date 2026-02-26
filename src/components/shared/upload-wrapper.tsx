import { m } from 'framer-motion';
import { Upload } from 'lucide-react';
import { ReactNode, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';

import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/sonner';
import { Body1 } from '@/components/ui/typography';
import {
  acceptedFileContentTypes,
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_MB,
} from '@/const/accepted-file-types';
import { cn } from '@/lib/utils';

const ONE_MB = 1048576; // bytes
const MAX_TOTAL_SIZE_MB = 512; // 0.5GB total
const MAX_TOTAL_SIZE = ONE_MB * MAX_TOTAL_SIZE_MB; // 0.5GB in bytes
const MAX_FILENAME_LENGTH = 255; // 255 bytes

function fileValidator(file: File, existingFiles: File[] = []) {
  // Check individual file size
  if (file.size > MAX_FILE_SIZE_BYTES) {
    const fileSizeMB = Math.round(file.size / ONE_MB);
    return {
      code: 'file-too-large',
      message: `File "${file.name}" is too large. Maximum size is ${MAX_FILE_SIZE_MB}MB. Found ${fileSizeMB}MB.`,
    };
  }

  // Check filename length
  if (file.name && file.name.length > MAX_FILENAME_LENGTH) {
    return {
      code: 'name-too-long',
      message: `Filename "${file.name}" is too long. Maximum length is ${MAX_FILENAME_LENGTH} characters.`,
    };
  }

  // Check total upload size
  const totalSize =
    existingFiles.reduce((sum, f) => sum + f.size, 0) + file.size;
  if (totalSize > MAX_TOTAL_SIZE) {
    const totalSizeMB = Math.round(totalSize / ONE_MB);
    return {
      code: 'total-size-exceeded',
      message: `Total upload size would exceed ${MAX_TOTAL_SIZE_MB}MB. Current total: ${totalSizeMB}MB.`,
    };
  }

  return null;
}

const mainVariant = {
  initial: {
    x: 0,
    y: 0,
  },
  animate: {
    x: 20,
    y: -20,
    opacity: 0.9,
  },
};

const secondaryVariant = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
};

export const FileUpload = ({
  multiple = false,
  onChange,
  children,
}: {
  multiple?: boolean;
  onChange: (files: File[]) => void;
  children?: ReactNode;
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (newFiles: File[]) => {
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    if (onChange) {
      onChange(newFiles);
    }

    setTimeout(() => {
      setFiles([]);
    }, 3000);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple,
    accept: acceptedFileContentTypes,
    onDrop: handleFileChange,
    onDropRejected: (error) => {
      error.map((e) => e.errors.map((err) => toast.error(err.message)));
    },
    validator: (file) => fileValidator(file, files),
  });

  if (children) {
    return (
      <div className="relative w-full" {...getRootProps()}>
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
              rx="20"
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
        {/*needed in safari*/}
        <input {...getInputProps()} className="hidden" />
        {children}
      </div>
    );
  }

  return (
    <Card
      className="w-full border border-zinc-200 bg-white"
      {...getRootProps()}
    >
      <m.div
        onClick={handleClick}
        whileHover="animate"
        className="group/file relative block w-full cursor-pointer overflow-hidden rounded-lg p-10"
      >
        <input
          ref={fileInputRef}
          id="file-upload-handle"
          type="file"
          onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
          className="hidden"
        />
        <div className="flex flex-col items-center justify-center">
          <p className="relative z-20 font-sans text-base font-bold text-zinc-600">
            Upload file
          </p>
          <p className="relative z-20 mt-2 font-sans text-base font-normal text-zinc-400">
            Drag or drop your files here or click to upload
          </p>
          <div className="relative mx-auto mt-10 w-full max-w-xl">
            {files.length > 0 && (
              <div className="flex justify-center">
                <Body1 className="text-center text-secondary">
                  FILE UPLOADED
                </Body1>
              </div>
            )}
            {!files.length && (
              <m.div
                layoutId="file-upload"
                variants={mainVariant}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 20,
                }}
                className={cn(
                  'relative z-40 mx-auto mt-4 flex h-32 w-full max-w-[8rem] items-center justify-center rounded-md bg-white group-hover/file:shadow-2xl',
                  'shadow-[0px_10px_50px_rgba(0,0,0,0.1)]',
                )}
              >
                {isDragActive ? (
                  <m.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center text-neutral-600"
                  >
                    Drop it
                    <Upload className="size-4 text-neutral-600 dark:text-neutral-400" />
                  </m.p>
                ) : (
                  <Upload className="size-4 text-neutral-600 dark:text-neutral-300" />
                )}
              </m.div>
            )}

            {!files.length && (
              <m.div
                variants={secondaryVariant}
                className="absolute inset-0 z-30 mx-auto mt-4 flex h-32 w-full max-w-32 items-center justify-center rounded-md border border-dashed border-vermillion-900 bg-transparent opacity-0"
              ></m.div>
            )}
          </div>
        </div>
      </m.div>
    </Card>
  );
};
