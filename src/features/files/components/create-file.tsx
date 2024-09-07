import {
  ChangeEventHandler,
  MouseEventHandler,
  ReactNode,
  useRef,
} from 'react';

import { Input } from '@/components/ui/input';
import { useCreateFile } from '@/features/files/api';

export function CreateFile({ children }: { children: ReactNode }): JSX.Element {
  const { mutate } = useCreateFile();

  const onClick: MouseEventHandler<HTMLDivElement> = (event) => {
    event.stopPropagation();
    fileInputRef.current && fileInputRef.current.click();
  };

  // TODO: Handle File Upload
  const onChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const file = event.target.files && event.target.files[0];

    if (file) {
      mutate({
        data: { file },
      });
    }
  };

  const fileInputRef = useRef<any | null>(null);

  return (
    <div onClick={onClick} role="presentation">
      <div>{children}</div>
      <div className="hidden">
        <Input
          id="file"
          type="file"
          className="hidden"
          ref={fileInputRef}
          onChange={onChange}
        />
      </div>
    </div>
  );
}
