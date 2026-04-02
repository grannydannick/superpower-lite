import { Droplet, Pill, TestTube } from 'lucide-react';

import { IconListItem } from '@/components/shared/icon-list';

export const URINE_SAMPLE_STEPS: IconListItem[] = [
  {
    icon: Pill,
    title: '24 Hours Before',
    description:
      'Stop taking vitamin C (ascorbic acid) if your daily dose is 500 mg or higher. High-dose vitamin C causes false negatives on the urine dipstick for glucose, blood, and infection markers. Avoid sexual activity - it can introduce contaminants and trigger a false-positive reading for blood.',
  },
  {
    icon: Droplet,
    title: 'Morning of',
    description:
      'Your first urine of the morning is the most concentrated and reliable sample. Drink water normally during your fast, do not overhydrate. Excess water dilutes your urine and can mask results. One glass before your appointment is enough.',
  },
  {
    icon: TestTube,
    title: 'At collection',
    description:
      'Wash your hands. Clean the genital area with the provided wipe. Begin urinating into the toilet, then catch the midstream urine in the cup. Fill to the line or roughly halfway. Do not touch the inside of the cup or lid.',
  },
];

export const URINE_SAMPLE_FEMALE_NOTES = [
  'Do not collect your urine sample during your period. Menstrual blood contaminates the specimen and the lab cannot adjust for it. Wait until your period has fully resolved before scheduling.',
  'If your blood draw timing is cycle-dependent and cannot be delayed, insert a fresh tampon before collection and collect a midstream sample. Results may still be affected. A retest will not be provided.',
];
