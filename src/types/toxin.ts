export type EnvironmentalToxinType =
  | 'Total Toxins'
  | 'Mycotoxins'
  | 'Environmental Toxin'
  | 'Heavy Metals';

export type EnvironmentalToxinPanel = {
  name: string;
  pdfUrl?: string;
};
