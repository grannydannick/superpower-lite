import React from 'react';

import { FileContentType } from '@/types/api';

export function ContentType({
  contentType,
}: {
  contentType: FileContentType;
}): JSX.Element {
  switch (contentType) {
    case 'application/pdf':
      return <span>PDF</span>;
    case 'video/mp4':
      return <span>VIDEO</span>;
    case 'text/csv':
      return <span>CSV</span>;
    case 'image/jpeg':
      return <span>JPEG</span>;
    case 'image/png':
      return <span>PNG</span>;
    default:
      return <>{contentType}</>;
  }
}
