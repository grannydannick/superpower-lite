import {
  CsvFileIcon,
  Mp4FileIcon,
  PdfFileIcon,
  UnknownFileIcon,
} from '@/components/icons';
import { cn } from '@/lib/utils';
import { File } from '@/types/api';

export function FileName({ file }: { file: File }): JSX.Element {
  const extension = (): JSX.Element => {
    switch (file.contentType) {
      case 'application/pdf':
        return <PdfFileIcon />;
      case 'text/csv':
        return <CsvFileIcon />;
      case 'video/mp4':
        return <Mp4FileIcon />;
      default:
        return <UnknownFileIcon />;
    }
  };

  return (
    <>
      <div>{extension()}</div>
      <h3
        className={cn(
          'ml-2 line-clamp-1 text-zinc-700',
          file.contentType === 'application/pdf'
            ? 'md:group-hover:text-vermillion-900'
            : null,
        )}
      >
        {file.name}
      </h3>
    </>
  );
}
