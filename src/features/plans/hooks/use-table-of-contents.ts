import { useEffect, useState } from 'react';

type SectionLink = {
  key: string;
  text: string;
  element: Element;
};

export function useTableOfContents() {
  const [sectionLinks, setSectionLinks] = useState<SectionLink[]>([]);
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [scrollPercentage, setScrollPercentage] = useState<number>(0);

  useEffect(() => {
    // Find all H2 elements with id="section-title"
    const h2Elements = document.querySelectorAll('h2#section-title');

    const links: SectionLink[] = Array.from(h2Elements).map((element) => {
      const text = element.textContent?.trim() || '';
      const key = text.toLowerCase().replace(/\s+/g, '-');
      return {
        key,
        text,
        element,
      };
    });

    setSectionLinks(links);

    if (links.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        let closestEntry = null as IntersectionObserverEntry | null;
        let minDistance = Infinity;

        entries.forEach((entry) => {
          const distance = Math.abs(entry.boundingClientRect.top);

          if (distance < minDistance) {
            minDistance = distance;
            closestEntry = entry;
          }
        });

        if (closestEntry && closestEntry.intersectionRatio > 0.5) {
          const matchedLink = links.find(
            (link) => link.element === closestEntry!.target,
          );

          if (matchedLink) {
            setActiveSection(matchedLink.key);
          }
        }
      },
      {
        root: null,
        rootMargin: '0px 0px -70% 0px',
        threshold: 0.5,
      },
    );

    links.forEach((link) => {
      observer.observe(link.element);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    let ticking = false;

    const calculateScrollPercentage = () => {
      const scrollTop = window.scrollY;
      const documentHeight = document.documentElement.scrollHeight;
      const windowHeight = window.innerHeight;
      const scrollableHeight = documentHeight - windowHeight;

      if (scrollableHeight <= 0) {
        setScrollPercentage(0);
        return;
      }

      const percentage = Math.round((scrollTop / scrollableHeight) * 100);
      setScrollPercentage(Math.min(100, Math.max(0, percentage)));
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(calculateScrollPercentage);
        ticking = true;
      }
    };

    calculateScrollPercentage();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return {
    sectionLinks,
    activeSection,
    scrollPercentage,
  };
}
