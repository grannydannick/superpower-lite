import { Upload } from 'lucide-react';

import { FileUpload } from '@/components/shared/upload-wrapper';
import { Button } from '@/components/ui/button';
import { useUploadFiles } from '@/features/files/api';

export const FileUploadButton = () => {
  const { mutate } = useUploadFiles();

  const onChange = (files: File[]) => {
    if (files.length === 0) return;
    mutate({ data: { files } });
  };

  return (
    <FileUpload multiple onChange={onChange}>
      <Button className="space-x-2.5 py-2.5">
        <div>
          <Upload className="size-4" />
        </div>
        <span> Upload</span>
      </Button>
    </FileUpload>
  );
};
