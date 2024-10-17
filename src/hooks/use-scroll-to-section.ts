import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Custom hook to scroll to a specific section based on URL hash or navigation state.
 *
 * @param {string} defaultId - The default section ID to scroll to if no hash or state is provided.
 */
const useScrollToSection = (defaultId: string = '') => {
  const location = useLocation();

  useEffect(() => {
    const scrollToElement = (id: string) => {
      const element = document.getElementById(id) || document.querySelector(id);
      if (element) {
        // Use smooth scrolling
        element.scrollIntoView({ behavior: 'smooth' });
      }
    };

    // Priority 1: Check for navigation state
    if (location.state?.scrollTo) {
      scrollToElement(location.state.scrollTo);
      return;
    }

    // Priority 2: Check for URL hash
    if (location.hash) {
      const id = location.hash.replace('#', '');
      scrollToElement(id);
      return;
    }

    // Priority 3: Scroll to default section if provided
    if (defaultId) {
      scrollToElement(defaultId);
    }
  }, [location, defaultId]);
};

export default useScrollToSection;
