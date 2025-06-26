import { useDropzone } from 'react-dropzone';

import { cn } from '@/lib/utils';

export const AvatarUploadWrapper = ({
  children,
  onFileChange,
  accept = {
    'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
  },
  multiple = false,
  className,
}: {
  children: React.ReactNode;
  onFileChange: (file: File) => void;
  accept?: Record<string, string[]>;
  multiple?: boolean;
  className?: string;
}) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        onFileChange(acceptedFiles[0]);
      }
    },
    accept,
    multiple,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        'relative cursor-pointer',
        isDragActive && 'opacity-80',
        className,
      )}
    >
      <input {...getInputProps()} />
      {children}
    </div>
  );
};
