import type { Area } from '@/features/digital-twin/types';

export const CATEGORY_MAP: Record<string, Area | undefined> = {
  'heart & vascular health': 'heart',
  'liver health': 'liver',
  'kidney health': 'kidney',
  'metabolic health': 'metabolic',
  inflammation: 'inflammation',
  nutrients: 'nutrients',
  energy: 'energy',
  'immune system': 'immune',
  'dna health': 'dna',
  'brain health': 'brain',
  'thyroid health': 'thyroid',
  'sex hormones': 'sex',
  'bood & oxygen': undefined,

  'gut health': 'gut',
  'toxin exposure': 'toxic',

  // categories not initially mapped - might need adjustments in the future
  gut: 'gut',
  'body health': 'body',
  toxic: 'toxic',
  skin: 'skin',
  sleep: 'sleep',
};
