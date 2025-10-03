import { useMemo } from 'react';

export interface SectionInfo {
  id: SectionId;
  title: string;
  order: number;
  total: number;
}

export type SectionId =
  | 'overview'
  | 'health-report'
  | 'monitored-issues'
  | 'protocol'
  | 'next-steps';

// Hook that returns section info for a specific section ID
export function useSection(sectionId: SectionId): SectionInfo {
  const sectionInfo = useMemo(() => {
    const baseSections: {
      id: SectionId;
      title: string;
    }[] = [
      { id: 'monitored-issues', title: 'Monitored Issues' },
      { id: 'protocol', title: 'Protocol' },
      { id: 'next-steps', title: 'Next Steps' },
    ];

    const sections = baseSections.map((section, index) => ({
      ...section,
      order: index + 1,
      total: baseSections.length,
    }));

    const section = sections.find((section) => section.id === sectionId);
    if (!section) {
      throw new Error(`Section with id '${sectionId}' not found`);
    }
    return section;
  }, [sectionId]);

  return sectionInfo;
}
