import { useEffect, useState } from 'react';

export const useBlur = ({ blurAfter = 10 }: { blurAfter?: number } = {}) => {
  const [isBlurred, setIsBlurred] = useState(false);

  useEffect(() => {
    let timeoutId: number;

    const handleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        setIsBlurred(window.scrollY > blurAfter);
      }, 5);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, [blurAfter]);

  return isBlurred;
};
