import { useEffect } from 'react';

const isIOS =
  typeof navigator !== 'undefined' &&
  /iP(hone|od|ad)/.test(navigator.userAgent);

export const usePreloadVideo = (url?: string) => {
  useEffect(() => {
    if (!url || isIOS) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'video';
    link.href = url;
    link.type = 'video/mp4';
    document.head.appendChild(link);

    return () => {
      if (link.parentNode) link.parentNode.removeChild(link);
    };
  }, [url]);
};
