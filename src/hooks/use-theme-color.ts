import { useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router';

import { WHITE_BACKGROUND_PATHS } from '@/const/white-background-paths';

export function useThemeColor() {
  const { pathname } = useLocation();
  const lastColorRef = useRef<string>();

  const themeColor = useMemo(() => {
    const isWhiteBg = WHITE_BACKGROUND_PATHS.some((path) =>
      pathname.includes(path),
    );
    return isWhiteBg ? '#ffffff' : '#fafafa';
  }, [pathname]);

  useEffect(() => {
    if (lastColorRef.current === themeColor) return;

    // set the body background color matching to theme color
    document.body.style.backgroundColor = themeColor;

    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', themeColor);
      lastColorRef.current = themeColor;
    }
  }, [themeColor]);
}
