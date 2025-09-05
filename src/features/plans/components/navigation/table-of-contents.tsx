import { Body2 } from '@/components/ui/typography';

import { useTableOfContents } from '../../hooks/use-table-of-contents';

export const TableOfContents = () => {
  const { sectionLinks, activeSection } = useTableOfContents();

  const activeIndex = sectionLinks.findIndex(
    (link) => link.key === activeSection,
  );

  const scrollToSection = (key: string) => {
    const targetLink = sectionLinks.find((link) => link.key === key);
    if (targetLink) {
      const elementRect = targetLink.element.getBoundingClientRect();

      // custom offset for the section titles to not be behind the nav bar
      const offsetPosition = elementRect.top + window.scrollY - 128;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="space-y-2">
      <nav className="relative pl-1.5">
        <div
          className="absolute left-0 mt-1.5 h-5 w-[1.5px] bg-vermillion-900 transition-all duration-200 ease-out"
          style={{
            transform: `translateY(${activeIndex >= 0 ? activeIndex * 32 : 0}px)`,
          }}
        />
        {sectionLinks.map((link, index) => (
          <button
            key={link.key}
            data-section={link.key}
            onClick={() => scrollToSection(link.key)}
            className="group flex h-8 w-full items-center gap-2 rounded-lg p-2 text-left text-sm transition-colors"
          >
            <Body2
              className={`transition-colors ${
                activeSection === link.key
                  ? 'font-medium text-zinc-950'
                  : 'text-zinc-500 group-hover:text-zinc-950'
              }`}
            >
              {index + 1}. {link.text}
            </Body2>
          </button>
        ))}
      </nav>
    </div>
  );
};
