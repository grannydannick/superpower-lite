import { Loader, Upload } from 'lucide-react';

import { FileUpload } from '@/components/shared/upload-wrapper';
import { Button } from '@/components/ui/button';
import { useUploadFiles, type UploadFilesResult } from '@/features/files/api';

export const FileUploadButton = ({
  onUploadSuccess,
  disabled = false,
  status = 'idle',
}: {
  onUploadSuccess?: (result: UploadFilesResult) => void;
  disabled?: boolean;
  status?: 'idle' | 'uploading' | 'processing';
}) => {
  const { mutate } = useUploadFiles({
    mutationConfig: onUploadSuccess
      ? { onSuccess: onUploadSuccess }
      : undefined,
  });

  const onChange = (files: File[]) => {
    if (files.length === 0) return;
    mutate({ data: { files } });
  };

  const label =
    status === 'uploading'
      ? 'Uploading...'
      : status === 'processing'
        ? 'Processing...'
        : 'Upload';

  return (
    <FileUpload multiple onChange={onChange} disabled={disabled}>
      <Button
        className="space-x-2.5 py-2.5"
        disabled={disabled}
        aria-busy={status !== 'idle'}
      >
        <div>
          {status === 'idle' ? (
            <Upload className="size-4" />
          ) : (
            <Loader className="size-4 animate-spin" />
          )}
        </div>
        <span>{label}</span>
      </Button>
    </FileUpload>
  );
};
