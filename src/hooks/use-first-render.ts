import React from 'react';

export const useIsFirstRender = () => {
  const isFirst = React.useRef(true);

  React.useEffect(() => {
    isFirst.current = false;
  }, []);

  return { isFirstRender: isFirst.current };
};
