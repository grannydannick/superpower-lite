import type { ReactNode } from 'react';

import type { OnboardingProduct } from '@/features/onboarding/api/onboarding-products';
import { useGender } from '@/hooks/use-gender';

import {
  ADVANCED_PANEL_FEMALE_BIOMARKERS,
  ADVANCED_PANEL_MALE_BIOMARKERS,
} from '../advanced-panel-biomarkers';

interface ProductBiomarkerGroup {
  title: string;
  markers: string[];
  countLabel?: string;
}

interface AdvancedPanelBiomarker {
  title: string;
}

interface AdvancedPanelBiomarkerGroupDefinition {
  title: string;
  markerTitles: string[];
}

const ADVANCED_PANEL_MALE_BIOMARKER_GROUPS: AdvancedPanelBiomarkerGroupDefinition[] =
  [
    {
      title: 'Advanced Cardiovascular',
      markerTitles: ['Lipoprotein (a)', 'Homocysteine'],
    },
    {
      title: 'Hormones',
      markerTitles: [
        'FSH and LH',
        'IGF-1, LC/MS',
        'Progesterone, Immunoassay',
        'Prolactin',
      ],
    },
    {
      title: 'Thyroid',
      markerTitles: [
        'Thyroid Peroxidase and Thyroglobulin Antibodies',
        'Free T3',
      ],
    },
    {
      title: "Men's Health",
      markerTitles: ['PSA, Free and Total'],
    },
    {
      title: 'Vitamins & Metabolism',
      markerTitles: [
        'Vitamin B12 (Cobalamin) and Folate Panel, Serum',
        'Insulin',
      ],
    },
    {
      title: 'Inflammation',
      markerTitles: ['Sed Rate by Modified Westergren'],
    },
    {
      title: 'Kidney & Urinary Health',
      markerTitles: ['Complete Urinalysis'],
    },
  ];

const ADVANCED_PANEL_FEMALE_BIOMARKER_GROUPS: AdvancedPanelBiomarkerGroupDefinition[] =
  [
    {
      title: 'Advanced Cardiovascular',
      markerTitles: ['Lipoprotein (a)', 'Homocysteine'],
    },
    {
      title: 'Hormones',
      markerTitles: [
        'FSH and LH',
        'IGF-1, LC/MS',
        'Progesterone, Immunoassay',
        'Prolactin',
      ],
    },
    {
      title: 'Thyroid',
      markerTitles: [
        'Thyroid Peroxidase and Thyroglobulin Antibodies',
        'Free T3',
      ],
    },
    {
      title: "Women's Health",
      markerTitles: ['AMH'],
    },
    {
      title: 'Vitamins & Metabolism',
      markerTitles: [
        'Vitamin B12 (Cobalamin) and Folate Panel, Serum',
        'Insulin',
      ],
    },
    {
      title: 'Inflammation',
      markerTitles: ['Sed Rate by Modified Westergren'],
    },
    {
      title: 'Kidney & Urinary Health',
      markerTitles: ['Complete Urinalysis'],
    },
  ];

const TOXIN_PRODUCT_BIOMARKER_GROUPS: Record<string, ProductBiomarkerGroup[]> =
  {
    'gut-microbiome-analysis': [
      {
        title: 'Gut Diversity Score',
        markers: [
          'Variety of bacteria in your microbiome linked to immunity and resilience',
        ],
      },
      {
        title: 'Beneficial bacteria',
        markers: [
          'Microbes supporting metabolism, reducing inflammation, producing short-chain fatty acids',
        ],
      },
      {
        title: 'Intestinal Permeability',
        markers: ['Signs of gut lining damage ("leaky gut")'],
      },
      {
        title: 'Harmful Organisms',
        markers: [
          'Parasites, bad bacteria, and fungi linked to digestive or systemic symptoms',
        ],
      },
    ],
    'heavy-metals': [
      {
        title: 'Neurotoxic metals',
        markers: ['Lead', 'Mercury', 'Aluminum', 'Thallium', 'Manganese'],
        countLabel: '5 markers',
      },
      {
        title: 'Cardiometabolic load',
        markers: ['Arsenic', 'Cadmium', 'Nickel'],
        countLabel: '3 markers',
      },
      {
        title: 'Kidney & detox burden',
        markers: ['Cadmium', 'Uranium', 'Bismuth', 'Tungsten'],
        countLabel: '4 markers',
      },
      {
        title: 'Immune & allergenic',
        markers: ['Nickel', 'Beryllium', 'Palladium'],
        countLabel: '3 markers',
      },
      {
        title: 'Environmental accumulation',
        markers: ['Barium', 'Cesium', 'Tin', 'Antimony', 'Gadolinium'],
        countLabel: '5 markers',
      },
    ],
    mycotoxins: [
      {
        title: 'Aflatoxins',
        markers: ['Aflatoxin M1'],
        countLabel: '1 data point',
      },
      {
        title: 'Ochratoxins',
        markers: ['Ochratoxin A'],
        countLabel: '1 data point',
      },
      {
        title: 'Trichothecenes',
        markers: ['Roridin E', 'Verrucarin A'],
        countLabel: '2 data points',
      },
      {
        title: 'Zearalenones',
        markers: ['Zearalenone'],
        countLabel: '1 data point',
      },
      {
        title: 'Other mycotoxins',
        markers: [
          'Chaetoglobosin A',
          'Citrinin',
          'Enniatin B',
          'Gliotoxin',
          'Mycophenolic Acid',
          'Sterigmatocystin',
        ],
        countLabel: '6 data points',
      },
    ],
    'environmental-toxins': [
      {
        title: 'Plastics & food packaging',
        markers: ['Phthalates (5)', 'Bisphenols (2)'],
        countLabel: '7 markers',
      },
      {
        title: 'Industrial & solvents',
        markers: ['VOCs'],
        countLabel: '7 markers',
      },
      {
        title: 'Personal care & cosmetics',
        markers: ['Parabens (4)', 'Oxybenzone (1)'],
        countLabel: '5 markers',
      },
      {
        title: 'Pesticides & herbicides',
        markers: [
          'Atrazine',
          '2,4-D',
          'Pyrethroids',
          'Organophosphates',
          'Glyphosate',
        ],
        countLabel: '5 markers',
      },
      {
        title: 'Flame retardants & food/water',
        markers: ['Triphenyl Phosphate', 'Acrylamide', 'Perchlorate'],
        countLabel: '3 markers',
      },
    ],
  };

export function ProductBiomarkerRows({
  product,
}: {
  product: OnboardingProduct;
}) {
  const { gender } = useGender();

  if (product.slug === 'advanced-blood-panel') {
    const biomarkers =
      gender === 'female'
        ? ADVANCED_PANEL_FEMALE_BIOMARKERS
        : ADVANCED_PANEL_MALE_BIOMARKERS;
    const groupDefinitions =
      gender === 'female'
        ? ADVANCED_PANEL_FEMALE_BIOMARKER_GROUPS
        : ADVANCED_PANEL_MALE_BIOMARKER_GROUPS;
    const advancedGroups = buildAdvancedPanelBiomarkerGroups(
      biomarkers,
      groupDefinitions,
    );

    return <ProductBiomarkerGroupRows groups={advancedGroups} />;
  }

  const toxinGroups = TOXIN_PRODUCT_BIOMARKER_GROUPS[product.slug];
  if (toxinGroups != null) {
    return <ProductBiomarkerGroupRows groups={toxinGroups} />;
  }

  const groups = new Map<string, string[]>();

  for (const b of product.biomarkers) {
    if (b.hidden === true) {
      continue;
    }

    const label = b.title.trim().length > 0 ? b.title.trim() : b.name.trim();
    if (label.length === 0) {
      continue;
    }

    let categoryTitle = 'Biomarkers';
    if (b.categories.length > 0) {
      const c = b.categories[0];
      const ct = c.title.trim().length > 0 ? c.title.trim() : c.name.trim();
      if (ct.length > 0) {
        categoryTitle = ct;
      }
    }

    let bucket = groups.get(categoryTitle);
    if (bucket == null) {
      bucket = [];
      groups.set(categoryTitle, bucket);
    }
    bucket.push(label);
  }

  if (groups.size === 0) {
    return null;
  }

  const productGroups: ProductBiomarkerGroup[] = [];

  for (const [categoryTitle, markerTitles] of groups.entries()) {
    if (markerTitles.length === 0) {
      continue;
    }

    productGroups.push({
      title: categoryTitle,
      markers: markerTitles,
      countLabel:
        markerTitles.length === 1
          ? '1 data point'
          : `${markerTitles.length} data points`,
    });
  }

  return <ProductBiomarkerGroupRows groups={productGroups} />;
}

function buildAdvancedPanelBiomarkerGroups(
  biomarkers: AdvancedPanelBiomarker[],
  groupDefinitions: AdvancedPanelBiomarkerGroupDefinition[],
) {
  const biomarkerByTitle = new Map<string, AdvancedPanelBiomarker>();
  for (const biomarker of biomarkers) {
    biomarkerByTitle.set(biomarker.title, biomarker);
  }

  const groups: ProductBiomarkerGroup[] = [];
  for (const groupDefinition of groupDefinitions) {
    const markers: string[] = [];
    for (const markerTitle of groupDefinition.markerTitles) {
      const biomarker = biomarkerByTitle.get(markerTitle);
      if (biomarker == null) {
        continue;
      }
      markers.push(biomarker.title);
    }

    if (markers.length === 0) {
      continue;
    }

    groups.push({
      title: groupDefinition.title,
      markers,
      countLabel:
        markers.length === 1 ? '1 marker' : `${markers.length} markers`,
    });
  }

  return groups;
}

function ProductBiomarkerGroupRows({
  groups,
}: {
  groups: ProductBiomarkerGroup[];
}) {
  const rows: ReactNode[] = [];

  for (const group of groups) {
    if (group.markers.length === 0) {
      continue;
    }

    rows.push(
      <div
        key={group.title}
        className="flex min-w-0 items-center px-6 py-3 first:pt-6 last:pb-5 md:px-0"
      >
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <p className="min-w-0 break-words text-sm leading-5 text-zinc-900">
              {group.title}
            </p>
            {group.countLabel != null && (
              <span className="shrink-0 rounded-full bg-zinc-50 px-2 py-0.5 text-xs leading-5 text-zinc-400">
                {group.countLabel}
              </span>
            )}
          </div>
          <p className="min-w-0 break-words text-sm leading-5 text-zinc-500">
            {group.markers.join(', ')}
          </p>
        </div>
      </div>,
    );
  }

  return <div>{rows}</div>;
}
