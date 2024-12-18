import { ReactNode } from 'react';
import { toast } from 'sonner';

import { FileUpload } from '@/components/shared/upload-wrapper';
import { useCreateFile } from '@/features/files/api';

export const FileUploadBanner = ({ children }: { children?: ReactNode }) => {
  const { mutate } = useCreateFile({
    mutationConfig: {
      onSuccess: () => {
        toast.success('File uploaded successfully.');
      },
    },
  });

  const onChange = (files: File[]) => {
    const file = files[0];

    if (file) {
      mutate({
        data: { file },
      });
    }
  };

  return <FileUpload onChange={onChange}>{children}</FileUpload>;
};
