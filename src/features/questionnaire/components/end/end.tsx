import React from 'react';

import { END_TYPE_KEY } from '../../core/constants';
import { QuestionnaireService } from '../../core/services/core.service';

export const End = ({
  children,
}: {
  children: ({ result }: { result: object }) => React.ReactNode;
}): React.ReactNode => {
  return children({ result: QuestionnaireService.getResult() });
};

End.__type = END_TYPE_KEY;
