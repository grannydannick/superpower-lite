import React, { ChangeEvent, useRef, useState } from 'react';

import { Body1 } from '@/components/ui/typography';

export type UploadWrapperProps = {
  apiError?: string;
  onSubmit: (file: File) => void;
  validTypes: Record<string, string>;
  disabled?: boolean;
  children: React.ReactNode;
};

export function UploadWrapper({
  onSubmit,
  validTypes,
  children,
  disabled,
  apiError,
}: UploadWrapperProps): JSX.Element {
  const [error, setError] = useState<string | null>(null);

  const handleFileInputChange = (
    event: ChangeEvent<HTMLInputElement>,
  ): void => {
    const file = event.target.files && event.target.files[0];
    if (file) {
      uploadFile(file);
    }
  };

  const uploadFile = (file: File): void => {
    //reset error to be empty
    setError(null);

    if (!validateFileType(file)) return;
    if (!validateFileSize(file.size)) return;
    if (!file) {
      setError('File Data undefined');
      return;
    }

    onSubmit(file);
  };
  //
  //TODO we maybe should set these server side and just do the validation there sending outcomes back
  const ONE_MB = 1048576; // bytes
  const MAX_MB = 5000;
  const MAX_FILE_SIZE = ONE_MB * MAX_MB; // 5000MB

  //TODO type
  const fileInputRef = useRef<any | null>(null);

  //TODO MP4 / MOV
  // const validTypes: Record<string, string> = {
  //   'video/mp4': 'MP4',
  //   'video/mov': 'MOV',
  // };

  const validateFileType = (file: File): boolean => {
    let validFileType = false;

    for (const type of Object.keys(validTypes)) {
      if (file.type.startsWith(type)) {
        validFileType = true;
        break;
      }
    }
    if (!validFileType) {
      setError(
        `Please select a valid file type. Found MIME type ${file.type}.`,
      );
      return false;
    }
    return true;
  };

  const validateFileSize = (size: number): boolean => {
    if (size > MAX_FILE_SIZE) {
      const truncated = ~~(size / ONE_MB);
      setError(`Please upload files less than 100mb. Found ${truncated} mb.`);
      return false;
    }
    return true;
  };

  function handleClick(): void {
    // Programmatically click the file input element
    fileInputRef.current && fileInputRef.current.click();
  }

  if (disabled) {
    return <>{children}</>;
  }

  return (
    <div
      role="presentation"
      onClick={handleClick}
      style={{ width: '100%', maxWidth: 1000 }}
    >
      <div>{children}</div>
      <input
        ref={fileInputRef}
        // accept={'video/*'}
        id="dropzone-file"
        type="file"
        className="hidden"
        onChange={handleFileInputChange}
      />
      {apiError && <Body1 className="text-pink-700">{apiError}</Body1>}
      {error && <Body1 className="text-pink-700">{error}</Body1>}
    </div>
  );
}
