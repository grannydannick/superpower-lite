import { useEffect, useState } from 'react';

export const useShowBg = (threshold = 50) => {
  const [isBlurred, setIsBlurred] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      setIsBlurred(scrollTop > threshold);
    };

    // Initial check in case the user is already scrolled
    handleScroll();

    window.addEventListener('scroll', handleScroll);

    // Cleanup the event listener on unmount
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [threshold]); // Re-run effect if threshold changes

  return isBlurred;
};
