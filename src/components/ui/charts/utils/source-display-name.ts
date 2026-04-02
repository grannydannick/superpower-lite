const DISPLAY_NAMES: Record<string, string> = {
  quest: 'Superpower - Quest',
  labcorp: 'Superpower - Labcorp',
  bioref: 'BioReference',
  custom: 'Custom',
};

export const sourceDisplayName = (source: string): string =>
  DISPLAY_NAMES[source] ?? source;
