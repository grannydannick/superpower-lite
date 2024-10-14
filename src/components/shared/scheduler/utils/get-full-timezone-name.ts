const TIMEZONE_ABBREVIATIONS: Record<string, string> = {
  EST: 'Eastern Standard Time',
  EDT: 'Eastern Daylight Time',
  CST: 'Central Standard Time',
  CDT: 'Central Daylight Time',
  MST: 'Mountain Standard Time',
  MDT: 'Mountain Daylight Time',
  PST: 'Pacific Standard Time',
  PDT: 'Pacific Daylight Time',
};

// Utility function to get the full timezone name
export const getFullTimezoneName = (abbr: string): string => {
  return TIMEZONE_ABBREVIATIONS[abbr] || abbr;
};
